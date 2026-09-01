import { View, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import AppText from '../components/AppText';
import { getTopic, findKing } from '../content/registry';

function RelatedContentLinks({ question, navigation }) {
  const topics = (question.relatedTopics || []).map((id) => getTopic(id)).filter(Boolean);
  const kings = (question.relatedKings || [])
    .map((rk) => {
      const king = findKing(rk.dynasty, rk.order);
      return king ? { ...rk, king } : null;
    })
    .filter(Boolean);

  if (topics.length === 0 && kings.length === 0) return null;

  return (
    <View style={s.relatedRow}>
      {topics.map((t) => (
        <TouchableOpacity
          key={t.id}
          style={s.relatedChip}
          onPress={() => navigation.navigate('TopicDetail', { id: t.id })}
        >
          <AppText style={s.relatedChipText}>📖 {t.title}</AppText>
        </TouchableOpacity>
      ))}
      {kings.map((k) => (
        <TouchableOpacity
          key={`${k.dynasty}-${k.order}`}
          style={s.relatedChip}
          onPress={() => navigation.navigate('KingDetail', { dynasty: k.dynasty, order: k.order })}
        >
          <AppText style={s.relatedChipText}>📖 {k.king.name}</AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function QuizResultScreen({ route, navigation }) {
  const { results, mode, level, timeUp } = route.params;
  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const badgeLabel =
    mode === 'wrong' ? '📌 오답노트 다시 풀기' : mode === 'mock' ? `⏱ ${level} 모의고사` : `📝 ${level} 문제풀이`;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <AppText style={s.badge}>{badgeLabel} 결과</AppText>
        {timeUp && <AppText style={s.timeUpNote}>⏱ 제한 시간이 끝나 자동으로 제출됐어요.</AppText>}
        <AppText style={s.scoreBig}>{correctCount} / {total}</AppText>
        <AppText style={s.scorePercent}>{percent}점</AppText>

        <AppText style={s.sectionTitle}>문제별 결과</AppText>
        {results.map((r, i) => (
          <View key={r.question.id} style={[s.resultCard, r.correct ? s.resultCorrect : s.resultWrong]}>
            <AppText style={s.resultIndex}>{i + 1}. {r.correct ? '✅ 정답' : '❌ 오답'}</AppText>
            <AppText style={s.resultQuestion}>{r.question.question}</AppText>
            {!r.correct && (
              <AppText style={s.resultAnswer}>
                정답: {r.question.answerIndex + 1}. {r.question.choices[r.question.answerIndex]}
              </AppText>
            )}
            <RelatedContentLinks question={r.question} navigation={navigation} />
          </View>
        ))}

        <View style={s.btnRow}>
          <TouchableOpacity
            style={s.btnSecondary}
            onPress={() => navigation.navigate('QuizHome')}
          >
            <AppText style={s.btnSecondaryText}>문제풀이 홈으로</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => {
              if (mode === 'wrong') {
                navigation.replace('Quiz', { mode: 'wrong' });
              } else if (mode === 'mock') {
                navigation.replace('Quiz', { mode: 'mock', level });
              } else {
                navigation.replace('Quiz', { level });
              }
            }}
          >
            <AppText style={s.btnPrimaryText}>다시 풀기</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3ecdc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scroll: { padding: 24, paddingBottom: 56 },
  badge: { fontSize: 15, fontWeight: '700', color: '#a83c32', marginBottom: 12 },
  timeUpNote: { fontSize: 14, fontWeight: '700', color: '#a83c32', marginBottom: 8 },
  scoreBig: { fontSize: 48, fontWeight: '800', color: '#2b2118', textAlign: 'center' },
  scorePercent: { fontSize: 20, fontWeight: '700', color: '#b8912f', textAlign: 'center', marginTop: 4, marginBottom: 28 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2b2118', marginBottom: 14 },

  resultCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10 },
  resultCorrect: { backgroundColor: '#eef4ee', borderColor: '#c7dcc9' },
  resultWrong: { backgroundColor: '#f8ece9', borderColor: '#e6bdb3' },
  resultIndex: { fontSize: 14, fontWeight: '700', color: '#5a5142', marginBottom: 6 },
  resultQuestion: { fontSize: 16, color: '#2b2118', lineHeight: 23 },
  resultAnswer: { fontSize: 15, color: '#a8471f', marginTop: 8, fontWeight: '600' },

  relatedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  relatedChip: {
    backgroundColor: '#fff8ee',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b8912f',
    paddingVertical: 8,
    paddingHorizontal: 12 },
  relatedChipText: { fontSize: 13, fontWeight: '700', color: '#b8912f' },

  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btnPrimary: { flex: 1, backgroundColor: '#a83c32', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnPrimaryText: { color: '#fff8ee', fontSize: 16, fontWeight: '700' },
  btnSecondary: { flex: 1, backgroundColor: '#efe4cc', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnSecondaryText: { color: '#8a7550', fontSize: 16, fontWeight: '700' } });
