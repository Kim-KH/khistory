import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { getCountByLevel, getTotalCount } from '../content/quizRegistry';
import { useWrongAnswers } from '../content/useWrongAnswers';

export default function QuizHomeScreen({ navigation }) {
  const { wrongIds, loaded } = useWrongAnswers();
  const basicCount = getCountByLevel('기본');
  const advancedCount = getCountByLevel('심화');

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← 홈</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.badge}>📝 문제풀이</Text>
        <Text style={s.title}>한국사능력검정시험 대비</Text>
        <Text style={s.subtitle}>총 {getTotalCount()}문제 · 기출 유형을 반영한 예상문제</Text>

        <TouchableOpacity
          style={[s.levelCard, s.basicCard]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Quiz', { level: '기본' })}
        >
          <Text style={s.levelTitle}>기본 (쉬움)</Text>
          <Text style={s.levelDesc}>널리 알려진 핵심 사실 위주 · {basicCount}문제 중 10문제</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.levelCard, s.advancedCard]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Quiz', { level: '심화' })}
        >
          <Text style={s.levelTitle}>심화 (어려움)</Text>
          <Text style={s.levelDesc}>세부 사실과 비교·구별 위주 · {advancedCount}문제 중 10문제</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.wrongNoteCard}
          activeOpacity={0.85}
          disabled={!loaded || wrongIds.length === 0}
          onPress={() => navigation.navigate('Quiz', { mode: 'wrong' })}
        >
          <Text style={s.wrongNoteTitle}>📌 오답노트</Text>
          <Text style={s.wrongNoteDesc}>
            {!loaded
              ? '불러오는 중...'
              : wrongIds.length === 0
              ? '아직 틀린 문제가 없어요. 문제를 풀어보세요!'
              : `틀렸던 문제 ${wrongIds.length}개 다시 풀기`}
          </Text>
        </TouchableOpacity>
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
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 4, alignSelf: 'flex-start' },
  backText: { fontSize: 17, fontWeight: '700', color: '#a8471f' },

  scroll: { padding: 20, paddingBottom: 48 },
  badge: { fontSize: 14, fontWeight: '700', color: '#a83c32', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#2b2118' },
  subtitle: { fontSize: 15, color: '#7a6f5d', marginTop: 8, marginBottom: 24 },

  levelCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  basicCard: { backgroundColor: '#4a7c59' },
  advancedCard: { backgroundColor: '#a83c32' },
  levelTitle: { fontSize: 22, fontWeight: '800', color: '#fff8ee' },
  levelDesc: { fontSize: 14, color: '#f3ecdc', marginTop: 6 },

  wrongNoteCard: {
    backgroundColor: '#faf6ec',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2d6bc',
    padding: 20,
    marginTop: 10,
  },
  wrongNoteTitle: { fontSize: 20, fontWeight: '800', color: '#b8912f' },
  wrongNoteDesc: { fontSize: 14, color: '#7a6f5d', marginTop: 6 },
});
