import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { buildQuizSet, getQuestionsByIds } from '../content/quizRegistry';
import { useWrongAnswers } from '../content/useWrongAnswers';

export default function QuizScreen({ route, navigation }) {
  const { level, mode } = route.params || {};
  const { wrongIds, markWrong, markCorrect } = useWrongAnswers();

  const questions = useMemo(() => {
    if (mode === 'wrong') return getQuestionsByIds(wrongIds);
    return buildQuizSet(level, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]); // { question, selectedIndex, correct }

  const current = questions[index];
  const isLast = index === questions.length - 1;

  if (!current) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>풀 수 있는 문제가 없습니다.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.goBack()}>
            <Text style={s.emptyBtnText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  function selectChoice(choiceIndex) {
    if (selected !== null) return; // 이미 답을 고른 뒤에는 바꿀 수 없음
    setSelected(choiceIndex);
    const correct = choiceIndex === current.answerIndex;
    if (correct) markCorrect(current.id);
    else markWrong(current.id);
    setResults((prev) => [...prev, { question: current, selectedIndex: choiceIndex, correct }]);
  }

  function next() {
    if (isLast) {
      navigation.replace('QuizResult', { results, mode, level });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
        >
          <Text style={s.backText}>← 그만하기</Text>
        </TouchableOpacity>
        <Text style={s.progress}>{index + 1} / {questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {current.level ? <Text style={s.levelTag}>{current.level}</Text> : null}
        <Text style={s.question}>{current.question}</Text>

        {current.choices.map((choice, i) => {
          const isSelected = selected === i;
          const isAnswer = i === current.answerIndex;
          const showState = selected !== null;
          return (
            <TouchableOpacity
              key={i}
              style={[
                s.choice,
                showState && isAnswer && s.choiceCorrect,
                showState && isSelected && !isAnswer && s.choiceWrong,
              ]}
              activeOpacity={0.8}
              onPress={() => selectChoice(i)}
              disabled={selected !== null}
            >
              <Text
                style={[
                  s.choiceText,
                  showState && isAnswer && s.choiceTextOnColor,
                  showState && isSelected && !isAnswer && s.choiceTextOnColor,
                ]}
              >
                {i + 1}. {choice}
              </Text>
            </TouchableOpacity>
          );
        })}

        {selected !== null && (
          <View style={s.explainBox}>
            <Text style={s.explainLabel}>
              {selected === current.answerIndex ? '✅ 정답입니다' : '❌ 오답입니다'}
            </Text>
            <Text style={s.explainText}>{current.explanation}</Text>
          </View>
        )}

        {selected !== null && (
          <TouchableOpacity style={s.nextBtn} onPress={next}>
            <Text style={s.nextBtnText}>{isLast ? '결과 보기' : '다음 문제'}</Text>
          </TouchableOpacity>
        )}
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
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  backBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  backText: { fontSize: 16, fontWeight: '700', color: '#a8471f' },
  progress: { fontSize: 16, fontWeight: '700', color: '#7a6f5d' },

  scroll: { padding: 24, paddingBottom: 56 },
  levelTag: {
    alignSelf: 'flex-start', fontSize: 13, fontWeight: '700', color: '#fff8ee',
    backgroundColor: '#b8912f', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    marginBottom: 14, overflow: 'hidden',
  },
  question: { fontSize: 21, fontWeight: '700', color: '#2b2118', lineHeight: 30, marginBottom: 22 },

  choice: {
    backgroundColor: '#faf6ec',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2d6bc',
    padding: 16,
    marginBottom: 12,
  },
  choiceCorrect: { backgroundColor: '#4a7c59', borderColor: '#4a7c59' },
  choiceWrong: { backgroundColor: '#a83c32', borderColor: '#a83c32' },
  choiceText: { fontSize: 17, color: '#2b2118', lineHeight: 24 },
  choiceTextOnColor: { color: '#fff8ee', fontWeight: '600' },

  explainBox: {
    backgroundColor: '#efe4cc',
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
  },
  explainLabel: { fontSize: 16, fontWeight: '800', color: '#2b2118', marginBottom: 8 },
  explainText: { fontSize: 16, color: '#5a5142', lineHeight: 24 },

  nextBtn: {
    backgroundColor: '#a83c32', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 20,
  },
  nextBtnText: { color: '#fff8ee', fontSize: 17, fontWeight: '700' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 17, color: '#5a5142', marginBottom: 16 },
  emptyBtn: { backgroundColor: '#a83c32', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { color: '#fff8ee', fontSize: 16, fontWeight: '700' },
});
