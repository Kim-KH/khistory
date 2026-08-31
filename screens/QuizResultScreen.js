import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
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
          <Text style={s.relatedChipText}>📖 {t.title}</Text>
        </TouchableOpacity>
      ))}
      {kings.map((k) => (
        <TouchableOpacity
          key={`${k.dynasty}-${k.order}`}
          style={s.relatedChip}
          onPress={() => navigation.navigate('KingDetail', { dynasty: k.dynasty, order: k.order })}
        >
          <Text style={s.relatedChipText}>📖 {k.king.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function QuizResultScreen({ route, navigation }) {
  const { results, mode, level } = route.params;
  const correctCount = results.filter((r) => r.correct).length;
  const total = results.length;
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.badge}>{mode === 'wrong' ? '📌 오답노트 다시 풀기' : `📝 ${level} 문제풀이`} 결과</Text>
        <Text style={s.scoreBig}>{correctCount} / {total}</Text>
        <Text style={s.scorePercent}>{percent}점</Text>

        <Text style={s.sectionTitle}>문제별 결과</Text>
        {results.map((r, i) => (
          <View key={r.question.id} style={[s.resultCard, r.correct ? s.resultCorrect : s.resultWrong]}>
            <Text style={s.resultIndex}>{i + 1}. {r.correct ? '✅ 정답' : '❌ 오답'}</Text>
            <Text style={s.resultQuestion}>{r.question.question}</Text>
            {!r.correct && (
              <Text style={s.resultAnswer}>
                정답: {r.question.answerIndex + 1}. {r.question.choices[r.question.answerIndex]}
              </Text>
            )}
            <RelatedContentLinks question={r.question} navigation={navigation} />
          </View>
        ))}

        <View style={s.btnRow}>
          <TouchableOpacity
            style={s.btnSecondary}
            onPress={() => navigation.navigate('QuizHome')}
          >
            <Text style={s.btnSecondaryText}>문제풀이 홈으로</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => {
              if (mode === 'wrong') {
                navigation.replace('Quiz', { mode: 'wrong' });
              } else {
                navigation.replace('Quiz', { level });
              }
            }}
          >
            <Text style={s.btnPrimaryText}>다시 풀기</Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scroll: { padding: 24, paddingBottom: 56 },
  badge: { fontSize: 15, fontWeight: '700', color: '#a83c32', marginBottom: 12 },
  scoreBig: { fontSize: 48, fontWeight: '800', color: '#2b2118', textAlign: 'center' },
  scorePercent: { fontSize: 20, fontWeight: '700', color: '#b8912f', textAlign: 'center', marginTop: 4, marginBottom: 28 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2b2118', marginBottom: 14 },

  resultCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
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
    paddingHorizontal: 12,
  },
  relatedChipText: { fontSize: 13, fontWeight: '700', color: '#b8912f' },

  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btnPrimary: { flex: 1, backgroundColor: '#a83c32', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnPrimaryText: { color: '#fff8ee', fontSize: 16, fontWeight: '700' },
  btnSecondary: { flex: 1, backgroundColor: '#efe4cc', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnSecondaryText: { color: '#8a7550', fontSize: 16, fontWeight: '700' },
});
