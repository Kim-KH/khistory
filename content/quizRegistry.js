import questionsData from './questions.json';

const QUESTIONS = questionsData.questions;

export function getQuestionsByLevel(level) {
  // level: '기본' | '심화' | 'all'
  if (level === 'all') return QUESTIONS;
  return QUESTIONS.filter((q) => q.level === level);
}

export function getQuestionById(id) {
  return QUESTIONS.find((q) => q.id === id) || null;
}

export function getQuestionsByIds(ids) {
  const idSet = new Set(ids);
  return QUESTIONS.filter((q) => idSet.has(q.id));
}

// Fisher-Yates 셔플 — 매번 다른 순서로 문제가 나오도록.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuizSet(level, count = 10) {
  const pool = getQuestionsByLevel(level);
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

export function getTotalCount() {
  return QUESTIONS.length;
}

export function getCountByLevel(level) {
  return getQuestionsByLevel(level).length;
}
