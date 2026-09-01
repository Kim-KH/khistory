import { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import AppText from '../components/AppText';
import * as Speech from 'expo-speech';
import { findKing, starsFor, getRelatedTopicsForKing, TOPIC_CATEGORIES } from '../content/registry';

function introText(king) {
  const orderLabel = typeof king.order === 'number' ? `${king.order}대 ` : '';
  return `${orderLabel}${king.name}. ${king.oneLiner} 재위 기간은 ${king.reignStart}년부터 ${king.reignEnd}년까지입니다.`;
}
function fullText(king) {
  return [introText(king), ...king.keyFacts, `왕위 계승 배경. ${king.succession}`].join(' ');
}

// 작은 스피커 버튼 하나 — 자기 담당 단락(segmentId)만 재생. 전체 듣기와 상태를 공유해서
// 다른 단락을 누르면 자동으로 이전 재생은 끊기고 이걸로 넘어간다.
function SegmentSpeaker({ segmentId, text, activeSegment, onPlay }) {
  const isActive = activeSegment === segmentId;
  return (
    <TouchableOpacity onPress={() => onPlay(segmentId, text)} style={s.segBtn} hitSlop={8}>
      <AppText style={s.segBtnText}>{isActive ? '⏹' : '🔊'}</AppText>
    </TouchableOpacity>
  );
}

export default function KingDetailScreen({ route, navigation }) {
  const { dynasty, order } = route.params;
  const king = findKing(dynasty, order);
  const [activeSegment, setActiveSegment] = useState(null); // null | 'all' | 'intro' | `fact-${i}` | 'succession'

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

  if (!king) {
    return (
      <SafeAreaView style={s.safe}>
        <AppText style={s.notFound}>왕 정보를 찾을 수 없습니다.</AppText>
      </SafeAreaView>
    );
  }

  const relatedTopics = getRelatedTopicsForKing(dynasty, order);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => { Speech.stop(); navigation.goBack(); }} style={s.backBtn}>
          <AppText style={s.backText}>← 목록</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => playSegment('all', fullText(king))}
          style={[s.listenBtn, activeSegment === 'all' && s.listenBtnActive]}
        >
          <AppText style={s.listenText}>{activeSegment === 'all' ? '⏹ 정지' : '🔊 전체 듣기'}</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.orderBadge}>
          <AppText style={s.orderText}>{typeof king.order === 'number' ? `제 ${king.order}대` : '비공식 · 정식 왕대수 제외'}</AppText>
        </View>
        <AppText style={s.name}>{king.name}</AppText>
        {king.personalName ? <AppText style={s.personalName}>본명 · {king.personalName}</AppText> : null}
        <AppText style={s.years}>{king.reignStart}년 ~ {king.reignEnd}년 재위</AppText>
        {(king.importance || king.keyword) && (
          <View style={s.importanceRow}>
            {king.importance ? <AppText style={s.starsBig}>{starsFor(king.importance)}</AppText> : null}
            {king.keyword ? <AppText style={s.keywordTagBig}>{king.keyword}</AppText> : null}
          </View>
        )}

        <View style={s.introRow}>
          <AppText style={s.oneLiner}>{king.oneLiner}</AppText>
          <SegmentSpeaker segmentId="intro" text={introText(king)} activeSegment={activeSegment} onPlay={playSegment} />
        </View>

        <View style={s.divider} />

        <View style={s.blockHeadRow}>
          <AppText style={s.blockTitle}>주요 사실</AppText>
          <SegmentSpeaker segmentId="facts" text={king.keyFacts.join(' ')} activeSegment={activeSegment} onPlay={playSegment} />
        </View>
        {king.keyFacts.map((fact, i) => (
          <View key={i} style={s.factRow}>
            <AppText style={s.factBullet}>•</AppText>
            <AppText style={s.factText}>{fact}</AppText>
          </View>
        ))}

        <View style={s.divider} />

        <View style={s.introRow}>
          <View style={{ flex: 1 }}>
            <AppText style={s.blockTitle}>왕위 계승</AppText>
            <AppText style={s.successionText}>{king.succession}</AppText>
          </View>
          <SegmentSpeaker segmentId="succession" text={king.succession} activeSegment={activeSegment} onPlay={playSegment} />
        </View>

        {relatedTopics.length > 0 && (
          <>
            <View style={s.divider} />
            <AppText style={s.blockTitle}>관련 콘텐츠</AppText>
            <View style={s.chipRow}>
              {relatedTopics.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={s.chip}
                  onPress={() => navigation.navigate('TopicDetail', { id: t.id })}
                >
                  <AppText style={s.chipText}>
                    {TOPIC_CATEGORIES.find((c) => c.key === t.category)?.icon} {t.title}
                  </AppText>
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

  orderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#b8912f', borderRadius: 20,
    paddingVertical: 5, paddingHorizontal: 14, marginBottom: 12 },
  orderText: { color: '#fff8ee', fontWeight: '700', fontSize: 14 },
  name: { fontSize: 36, fontWeight: '800', color: '#2b2118' },
  personalName: { fontSize: 16, color: '#7a6f5d', marginTop: 4 },
  years: { fontSize: 18, fontWeight: '700', color: '#a8471f', marginTop: 8 },

  importanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  starsBig: { fontSize: 17, color: '#b8912f', letterSpacing: 2 },
  keywordTagBig: {
    fontSize: 14, fontWeight: '700', color: '#8a7550', backgroundColor: '#efe4cc',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },

  introRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 20 },
  oneLiner: { flex: 1, fontSize: 20, color: '#2b2118', lineHeight: 29, fontWeight: '600' },

  divider: { height: 1, backgroundColor: '#e2d6bc', marginVertical: 26 },

  blockTitle: { fontSize: 15, fontWeight: '700', color: '#a8471f', textTransform: 'uppercase', letterSpacing: 0.5 },
  blockHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },

  factRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  factBullet: { fontSize: 19, color: '#b8912f', lineHeight: 27 },
  factText: { flex: 1, fontSize: 18, color: '#2b2118', lineHeight: 27 },

  successionText: { fontSize: 18, color: '#2b2118', lineHeight: 27, marginTop: 14 },

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
