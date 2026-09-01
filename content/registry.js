// 새 시대/왕조를 추가할 때는 여기 한 곳에만 등록하면 홈 카탈로그·검색·상세화면이
// 전부 자동으로 인식한다 — 화면마다 import 목록을 따로 관리하지 않도록 하기 위함.
//
// CATALOG 항목은 두 종류:
//  - { type: 'dynasty', ... } : 홈에서 바로 눌러서 왕 목록으로 들어가는 단일 왕조 (조선, 고려)
//  - { type: 'group', ... }   : 여러 왕조를 묶는 상위 카테고리 (삼국시대 → 고구려/백제/신라).
//                               children은 아래 DYNASTY_MAP의 key 배열.
import joseonData from './joseon-kings.json';
import goryeoData from './goryeo-kings.json';
import goguryeoData from './goguryeo-kings.json';
import baekjeData from './baekje-kings.json';
import sillaData from './silla-kings.json';
import hugoguryeoData from './hugoguryeo-kings.json';
import hubaekjeData from './hubaekje-kings.json';
import balhaeData from './balhae-kings.json';
import geumgwangayaData from './geumgwangaya-kings.json';
import daegayaData from './daegaya-kings.json';
import prehistoricData from './prehistoric-gojoseon.json';
import topicsData from './topics.json';

// key로 바로 찾을 수 있는 왕조 원본 데이터
const DYNASTY_MAP = {
  joseon: { key: 'joseon', title: '조선왕조', period: '1392 ~ 1910', data: joseonData },
  goryeo: { key: 'goryeo', title: '고려왕조', period: '918 ~ 1392', data: goryeoData },
  goguryeo: { key: 'goguryeo', title: '고구려', period: '기원전 37 ~ 668', data: goguryeoData },
  baekje: { key: 'baekje', title: '백제', period: '기원전 18 ~ 660', data: baekjeData },
  silla: { key: 'silla', title: '신라', period: '기원전 57 ~ 935', data: sillaData },
  hugoguryeo: { key: 'hugoguryeo', title: '후고구려(태봉)', period: '901 ~ 918', data: hugoguryeoData },
  hubaekje: { key: 'hubaekje', title: '후백제', period: '900 ~ 936', data: hubaekjeData },
  balhae: { key: 'balhae', title: '발해', period: '698 ~ 926', data: balhaeData },
  geumgwangaya: { key: 'geumgwangaya', title: '금관가야', period: '42 ~ 532', data: geumgwangayaData },
  daegaya: { key: 'daegaya', title: '대가야', period: '? ~ 562', data: daegayaData },
  prehistoric: { key: 'prehistoric', title: '선사시대·고조선', period: '기원전 70만년 ~ 기원전 108', data: prehistoricData },
};

// 홈 화면에 보이는 순서 (최근 시대 → 과거 시대)
export const CATALOG = [
  { type: 'dynasty', ...DYNASTY_MAP.joseon },
  { type: 'dynasty', ...DYNASTY_MAP.goryeo },
  {
    type: 'group', key: 'samguk', title: '삼국시대', period: '기원전 1세기 ~ 668',
    children: ['goguryeo', 'baekje', 'silla'],
  },
  {
    type: 'group', key: 'husamguk', title: '후삼국시대', period: '900 ~ 936',
    // 신라는 별도 데이터를 새로 안 만들고 삼국시대 신라를 그대로 재사용하되, 이 시기와
    // 실제로 겹치는 51대(진성왕)~56대(경순왕)만 보이도록 범위를 지정. 전체 신라는
    // crossLink로 삼국시대 쪽으로 안내.
    children: [
      'hugoguryeo',
      'hubaekje',
      {
        key: 'silla', from: 51, periodOverride: '887 ~ 935 (후삼국 시기)',
        crossLink: { group: 'samguk', label: '삼국시대로 분류되는 신라는 여기를 눌러서 보세요' },
      },
    ],
  },
  {
    type: 'group', key: 'namboekguk', title: '남북국시대', period: '698 ~ 926',
    // 신라(남국)는 삼국시대 데이터를 재사용하되 삼국통일(676, 30대 문무왕) 이후만.
    children: [
      'balhae',
      {
        key: 'silla', from: 30, periodOverride: '676 ~ 935 (통일신라)',
        crossLink: { group: 'samguk', label: '삼국시대로 분류되는 신라는 여기를 눌러서 보세요' },
      },
    ],
  },
  {
    type: 'group', key: 'gaya', title: '가야', period: '42 ~ 562',
    children: ['geumgwangaya', 'daegaya'],
    // 아라가야·소가야·고령가야·성산가야 등 다른 가야 소국들은 기록이 매우 단편적이거나
    // 실존 여부 자체가 불확실해 신뢰할 만한 콘텐츠로 만들기 어려워 제외함.
  },
  { type: 'dynasty', ...DYNASTY_MAP.prehistoric },
];

// group의 children 항목은 문자열(키만) 또는 { key, from, periodOverride, crossLink } 객체 —
// 문자열이면 전체를 그대로 보여주는 것으로 취급해 객체 형태로 정규화한다.
export function resolveChild(child) {
  return typeof child === 'string' ? { key: child } : child;
}

// 그룹(삼국시대 등)에 속한 모든 나라의 왕을 합친 총 인원수 — 신라처럼 여러 그룹이
// 같은 왕조 데이터를 부분적으로(from 이후만) 재사용하는 경우도 정확히 반영한다.
export function getGroupTotalKingCount(group) {
  return group.children.reduce((sum, child) => {
    const resolved = resolveChild(child);
    const dynasty = getDynasty(resolved.key);
    if (!dynasty) return sum;
    const kings = dynasty.data.kings;
    const count = resolved.from
      ? kings.filter((k) => typeof k.order === 'number' && k.order >= resolved.from).length
      : kings.length;
    return sum + count;
  }, 0);
}

// 시험/교과서 비중 별점 표시 — importance 필드가 없는 왕(계보상 존재)은 빈 문자열 반환.
// 이모지 별(⭐)은 항상 노란색으로 고정 렌더링되어 글자색 지정이 안 먹기 때문에,
// 색 지정이 가능한 기호(★, U+2605)를 쓴다 — 실제 색은 각 화면에서 지정.
export function starsFor(importance) {
  if (!importance) return '';
  return '★'.repeat(importance);
}

export function getDynasty(key) {
  return DYNASTY_MAP[key] || null;
}

export function getGroup(key) {
  return CATALOG.find((c) => c.type === 'group' && c.key === key) || null;
}

export function findKing(dynastyKey, order) {
  const dynasty = getDynasty(dynastyKey);
  return dynasty ? dynasty.data.kings.find((k) => k.order === order) : null;
}

function matchesQuery(king, q) {
  const hay = [king.name, king.personalName, king.oneLiner, king.succession, ...king.keyFacts]
    .filter(Boolean)
    .join(' ');
  return hay.includes(q);
}

// 검색은 등록된 모든 왕조를 가로질러 한 번에 찾는다 (기전체/편년체 어느 쪽으로 콘텐츠가
// 늘어나도 검색만큼은 항상 전체를 대상으로 하기로 함).
export function searchAllDynasties(query) {
  const q = query.trim();
  if (!q) return [];
  const results = [];
  for (const dynasty of Object.values(DYNASTY_MAP)) {
    for (const king of dynasty.data.kings) {
      if (matchesQuery(king, q)) {
        results.push({ ...king, resultType: 'king', dynastyKey: dynasty.key, dynastyTitle: dynasty.title });
      }
    }
  }
  return results;
}

// ── 기전체(주제) 레이어 — 왕 목록과 별개로, 전쟁/사건/제도/문화/예술/인물을
// 카테고리별로 묶은 것. 왕 페이지와는 relatedKings로 서로 연결한다. ─────────
export const TOPIC_CATEGORIES = [
  { key: '전쟁', title: '전쟁', icon: '⚔️' },
  { key: '사건', title: '사건', icon: '📜' },
  { key: '제도', title: '제도', icon: '🏛️' },
  { key: '경제', title: '경제', icon: '💰' },
  { key: '토지제도', title: '토지제/군역', icon: '🌾' },
  { key: '조세', title: '조세', icon: '🧾' },
  { key: '사회신분', title: '사회신분', icon: '🧑‍🤝‍🧑' },
  { key: '군사제도', title: '군사제도', icon: '🛡️' },
  { key: '종교/사상', title: '종교/사상', icon: '☸️' },
  { key: '과학/기술', title: '과학/기술', icon: '🔬' },
  { key: '문화', title: '문화', icon: '📖' },
  { key: '예술/건축', title: '예술/건축', icon: '🎨' },
  { key: '인물', title: '인물', icon: '👤' },
];

const TOPICS = topicsData.topics;

// 정렬용 연도 계산 — yearStart가 없는 항목(예: 생몰년 미상 인물)은 관련 왕의 재위
// 시작년도로 대신 추정한다. 그것도 없으면 맨 뒤(과거)로 보낸다.
function sortYear(topic) {
  if (typeof topic.yearStart === 'number') return topic.yearStart;
  const rk = (topic.relatedKings || [])[0];
  if (rk) {
    const king = findKing(rk.dynasty, rk.order);
    if (king && typeof king.reignStart === 'number') return king.reignStart;
  }
  return -Infinity;
}

// 카테고리 안에서는 항상 최신순(연대 내림차순)으로 보여준다 — 홈 화면의 왕조
// 카탈로그(조선→고려→...→선사시대)와 같은 방향이라, 두 보기 모드를 오가도 순서
// 감각이 일관되게 유지된다.
export function getTopicsByCategory(category) {
  return TOPICS.filter((t) => t.category === category)
    .slice()
    .sort((a, b) => sortYear(b) - sortYear(a));
}

export function getTopic(id) {
  return TOPICS.find((t) => t.id === id) || null;
}

// 왕 상세 화면에서 "이 왕과 관련된 주제" 역참조용
export function getRelatedTopicsForKing(dynastyKey, order) {
  return TOPICS.filter((t) =>
    (t.relatedKings || []).some((rk) => rk.dynasty === dynastyKey && rk.order === order)
  );
}

function matchesTopicQuery(topic, q) {
  const narrativeParts = topic.narrative
    ? [topic.narrative.cause, topic.narrative.development, topic.narrative.crisis, topic.narrative.conclusion]
    : [];
  const hay = [topic.title, topic.oneLiner, ...(topic.keyFacts || []), ...narrativeParts]
    .filter(Boolean)
    .join(' ');
  return hay.includes(q);
}

export function searchTopics(query) {
  const q = query.trim();
  if (!q) return [];
  return TOPICS.filter((t) => matchesTopicQuery(t, q)).map((t) => ({ ...t, resultType: 'topic' }));
}

// 왕+주제를 한 번에 찾는 통합 검색 — "즉석 질문" 용도로는 이걸 쓴다.
export function searchEverything(query) {
  return [...searchAllDynasties(query), ...searchTopics(query)];
}
