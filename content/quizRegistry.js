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

const ANCIENT_ERAS = ['고조선', '고구려', '백제', '신라', '삼국', '통일신라', '발해'];

function eraBucket(era) {
  return ANCIENT_ERAS.includes(era) ? '고대사' : era;
}

// 한능검 실제 출제 비중을 반영한 시대별 목표 문항 수 (50문항 기준).
const MOCK_EXAM_WEIGHTS = { 고대사: 7, 고려: 8, 조선: 11, 근현대: 24 };
const MOCK_EXAM_ORDER = ['고대사', '고려', '조선', '근현대'];
export const MOCK_EXAM_TOTAL = 50;
export const MOCK_EXAM_MINUTES = { 기본: 75, 심화: 80 };

// 실제 한능검처럼 시대 비중에 맞춰 50문항을 구성하고, 고대사→근현대 순으로 배열한다.
// 부족한 시대가 있으면 그만큼을 문항이 가장 많은 근현대에서 채운다.
export function buildMockExam(level) {
  const pool = getQuestionsByLevel(level);
  const byEra = {};
  MOCK_EXAM_ORDER.forEach((era) => { byEra[era] = shuffle(pool.filter((q) => eraBucket(q.era) === era)); });

  const picked = {};
  let shortfall = 0;
  MOCK_EXAM_ORDER.forEach((era) => {
    const target = MOCK_EXAM_WEIGHTS[era];
    const take = Math.min(target, byEra[era].length);
    picked[era] = byEra[era].slice(0, take);
    shortfall += target - take;
  });

  if (shortfall > 0) {
    const extra = byEra['근현대'].slice(picked['근현대'].length, picked['근현대'].length + shortfall);
    picked['근현대'] = picked['근현대'].concat(extra);
  }

  return MOCK_EXAM_ORDER.flatMap((era) => picked[era]);
}
