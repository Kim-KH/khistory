import { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import AppText from '../components/AppText';
import * as Speech from 'expo-speech';
import { getTopic, getDynasty, findKing, starsFor, TOPIC_CATEGORIES } from '../content/registry';

const NARRATIVE_STAGES = [
  { key: 'cause', label: '원인·발단' },
  { key: 'development', label: '전개' },
  { key: 'crisis', label: '위기·절정' },
  { key: 'conclusion', label: '결말' },
];

function introText(topic) {
  return `${topic.title}. ${topic.oneLiner}`;
}
function fullText(topic) {
  if (topic.narrative) {
    const stages = NARRATIVE_STAGES.map((s) => topic.narrative[s.key]).filter(Boolean);
    return [introText(topic), ...stages].join(' ');
  }
  return [introText(topic), ...topic.keyFacts].join(' ');
}

function SegmentSpeaker({ segmentId, text, activeSegment, onPlay }) {
  const isActive = activeSegment === segmentId;
  return (
    <TouchableOpacity onPress={() => onPlay(segmentId, text)} style={s.segBtn} hitSlop={8}>
      <AppText style={s.segBtnText}>{isActive ? '⏹' : '🔊'}</AppText>
    </TouchableOpacity>
  );
}

export default function TopicDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const topic = getTopic(id);
  const [activeSegment, setActiveSegment] = useState(null);

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  function playSegment(segmentId, text) {
    if (activeSegment === segmentId) {
      Speech.stop();
      setActiveSegment(null);
      return;
    }
    Speech.stop();
    setActiveSegment(segmentId);
    Speech.speak(text, {
      language: 'ko-KR',
      rate: 0.95,
      onDone: () => setActiveSegment(null),
      onStopped: () => setActiveSegment(null),
      onError: () => setActiveSegment(null) });
  }

  if (!topic) {
    return (
      <SafeAreaView style={s.safe}>
        <AppText style={s.notFound}>주제를 찾을 수 없습니다.</AppText>
      </SafeAreaView>
    );
  }

  const categoryInfo = TOPIC_CATEGORIES.find((c) => c.key === topic.category);
  const relatedKings = (topic.relatedKings || [])
    .map((rk) => ({ ...rk, king: findKing(rk.dynasty, rk.order), dynastyInfo: getDynasty(rk.dynasty) }))
    .filter((rk) => rk.king);
  const relatedTopics = (topic.relatedTopics || []).map((tid) => getTopic(tid)).filter(Boolean);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => { Speech.stop(); navigation.goBack(); }} style={s.backBtn}>
          <AppText style={s.backText}>← 목록</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => playSegment('all', fullText(topic))}
          style={[s.listenBtn, activeSegment === 'all' && s.listenBtnActive]}
        >
          <AppText style={s.listenText}>{activeSegment === 'all' ? '⏹ 정지' : '🔊 전체 듣기'}</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.categoryBadge}>
          <AppText style={s.categoryText}>{categoryInfo?.icon} {categoryInfo?.title}</AppText>
        </View>
        <AppText style={s.name}>{topic.title}</AppText>
        <AppText style={s.era}>
          {topic.era}
          {topic.yearStart ? ` · ${topic.yearStart}${topic.yearEnd && topic.yearEnd !== topic.yearStart ? `~${topic.yearEnd}` : ''}년` : ''}
        </AppText>
        {topic.importance ? <AppText style={s.starsBig}>{starsFor(topic.importance)}</AppText> : null}

        <View style={s.introRow}>
          <AppText style={s.oneLiner}>{topic.oneLiner}</AppText>
          <SegmentSpeaker segmentId="intro" text={introText(topic)} activeSegment={activeSegment} onPlay={playSegment} />
        </View>

        {topic.narrative ? (
          NARRATIVE_STAGES.map((stage, i) => {
            const text = topic.narrative[stage.key];
            if (!text) return null;
            return (
              <View key={stage.key}>
                {i > 0 && <View style={s.divider} />}
                <View style={s.blockHeadRow}>
                  <View style={s.stageLabelRow}>
                    <AppText style={s.stageNumber}>{i + 1}</AppText>
                    <AppText style={s.blockTitle}>{stage.label}</AppText>
                  </View>
                  <SegmentSpeaker segmentId={stage.key} text={text} activeSegment={activeSegment} onPlay={playSegment} />
                </View>
                <AppText style={s.narrativeText}>{text}</AppText>
              </View>
            );
          })
        ) : (
          <>
            <View style={s.divider} />
            <View style={s.blockHeadRow}>
              <AppText style={s.blockTitle}>주요 사실</AppText>
              <SegmentSpeaker segmentId="facts" text={topic.keyFacts.join(' ')} activeSegment={activeSegment} onPlay={playSegment} />
            </View>
            {topic.keyFacts.map((fact, i) => (
              <View key={i} style={s.factRow}>
                <AppText style={s.factBullet}>•</AppText>
                <AppText style={s.factText}>{fact}</AppText>
              </View>
            ))}
          </>
        )}

        {(relatedKings.length > 0 || relatedTopics.length > 0) && (
          <>
            <View style={s.divider} />
            <AppText style={s.blockTitle}>관련 콘텐츠</AppText>
            <View style={s.chipRow}>
              {relatedKings.map((rk, i) => (
                <TouchableOpacity
                  key={`k-${i}`}
                  style={s.chip}
                  onPress={() => navigation.navigate('KingDetail', { dynasty: rk.dynasty, order: rk.order })}
                >
                  <AppText style={s.chipText}>👑 {rk.dynastyInfo?.title} · {rk.king.name}</AppText>
                </TouchableOpacity>
              ))}
              {relatedTopics.map((rt) => (
                <TouchableOpacity
                  key={rt.id}
                  style={s.chip}
                  onPress={() => navigation.navigate('TopicDetail', { id: rt.id })}
                >
                  <AppText style={s.chipText}>{TOPIC_CATEGORIES.find((c) => c.key === rt.category)?.icon} {rt.title}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3ecdc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  notFound: { fontSize: 18, color: '#2b2118', padding: 24 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  backText: { fontSize: 17, fontWeight: '700', color: '#a8471f' },
  listenBtn: {
    backgroundColor: '#a83c32', borderRadius: 22,
    paddingVertical: 10, paddingHorizontal: 18 },
  listenBtnActive: { backgroundColor: '#7a2a23' },
  listenText: { color: '#fff8ee', fontSize: 16, fontWeight: '700' },

  scroll: { padding: 24, paddingBottom: 56 },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#a83c32', borderRadius: 20,
    paddingVertical: 5, paddingHorizontal: 14, marginBottom: 12 },
  categoryText: { color: '#fff8ee', fontWeight: '700', fontSize: 14 },
  name: { fontSize: 34, fontWeight: '800', color: '#2b2118' },
  era: { fontSize: 18, fontWeight: '700', color: '#a8471f', marginTop: 8 },
  starsBig: { fontSize: 17, color: '#b8912f', letterSpacing: 2, marginTop: 8 },

  introRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 20 },
  oneLiner: { flex: 1, fontSize: 20, color: '#2b2118', lineHeight: 29, fontWeight: '600' },

  divider: { height: 1, backgroundColor: '#e2d6bc', marginVertical: 26 },

  blockTitle: { fontSize: 15, fontWeight: '700', color: '#a8471f', textTransform: 'uppercase', letterSpacing: 0.5 },
  blockHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },

  stageLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stageNumber: {
    fontSize: 13, fontWeight: '800', color: '#fff8ee', backgroundColor: '#b8912f',
    width: 22, height: 22, borderRadius: 11, textAlign: 'center', lineHeight: 22, overflow: 'hidden' },
  narrativeText: { fontSize: 18, color: '#2b2118', lineHeight: 28, marginBottom: 6 },

  factRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  factBullet: { fontSize: 19, color: '#b8912f', lineHeight: 27 },
  factText: { flex: 1, fontSize: 18, color: '#2b2118', lineHeight: 27 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  chip: {
    backgroundColor: '#efe4cc', borderRadius: 20,
    paddingVertical: 10, paddingHorizontal: 16 },
  chipText: { fontSize: 14, fontWeight: '700', color: '#8a5a3a' },

  segBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#efe4cc',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0 },
  segBtnText: { fontSize: 15 } });
