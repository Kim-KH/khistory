import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { CATALOG, TOPIC_CATEGORIES, getTopicsByCategory, searchEverything, starsFor } from '../content/registry';
import { useHotCornerItems } from '../content/useHotCorner';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('era'); // 'era' | 'topic'
  const q = query.trim();
  const { items: hotCornerItems } = useHotCornerItems();
  const latestHotCorner = hotCornerItems[0];

  const searchResults = useMemo(() => searchEverything(q), [q]);
  const isSearching = q !== '';
  const listData = isSearching ? searchResults : mode === 'era' ? CATALOG : TOPIC_CATEGORIES;

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={listData}
        keyExtractor={(item, index) =>
          isSearching ? `${item.resultType}-${item.dynastyKey || ''}-${item.id || item.order}-${index}` : item.key
        }
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <Text style={s.appTitle}>한국사 한입</Text>
            <Text style={s.appSubtitle}>매일 조금씩, 크게 보고 편하게 듣는 역사</Text>

            <View style={s.searchBox}>
              <Text style={s.searchIcon}>🔍</Text>
              <TextInput
                style={s.searchInput}
                placeholder="왕, 사건, 인물로 검색 (예: 세종, 이순신)"
                placeholderTextColor="#a8997a"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
                  <Text style={s.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {!isSearching && (
              <>
                <TouchableOpacity
                  style={s.hotCard}
                  onPress={() => navigation.navigate('HotCornerList')}
                  activeOpacity={0.85}
                >
                  <Text style={s.hotBadge}>🔥 핫코너 · {hotCornerItems.length}개</Text>
                  {latestHotCorner && (
                    <>
                      <Text style={s.hotTitle}>
                        {latestHotCorner.movieFacts?.title || latestHotCorner.issueFacts?.title}
                      </Text>
                      <Text style={s.hotDesc}>{latestHotCorner.trigger}</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.quizCard}
                  onPress={() => navigation.navigate('QuizHome')}
                  activeOpacity={0.85}
                >
                  <Text style={s.quizBadge}>📝 문제풀이</Text>
                  <Text style={s.quizTitle}>한국사능력검정시험 대비 문제 풀어보기</Text>
                  <Text style={s.quizDesc}>기본·심화 난이도 · 오답노트 자동 저장</Text>
                </TouchableOpacity>

                <View style={s.modeTabs}>
                  <TouchableOpacity
                    style={[s.modeTab, mode === 'era' && s.modeTabActive]}
                    onPress={() => setMode('era')}
                  >
                    <Text style={[s.modeTabText, mode === 'era' && s.modeTabTextActive]}>시대별로 (편년체)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.modeTab, mode === 'topic' && s.modeTabActive]}
                    onPress={() => setMode('topic')}
                  >
                    <Text style={[s.modeTabText, mode === 'topic' && s.modeTabTextActive]}>주제별로 (기전체)</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Text style={s.sectionTitle}>
              {isSearching ? `"${q}" 검색 결과` : mode === 'era' ? '시대별로 살펴보기' : '주제별로 살펴보기'}
            </Text>
            {isSearching && <Text style={s.sectionSub}>{searchResults.length}건 · 왕과 주제를 함께 찾았어요</Text>}
          </>
        }
        ListEmptyComponent={
          isSearching ? <Text style={s.emptyText}>검색 결과가 없습니다. 다른 단어로 찾아보세요.</Text> : null
        }
        renderItem={({ item }) => {
          if (isSearching) {
            return item.resultType === 'topic' ? (
              <TouchableOpacity
                style={s.kingRow}
                onPress={() => navigation.navigate('TopicDetail', { id: item.id })}
                activeOpacity={0.7}
              >
                <View style={[s.orderBadge, s.topicBadge]}>
                  <Text style={s.orderText}>{TOPIC_CATEGORIES.find((c) => c.key === item.category)?.icon}</Text>
                </View>
                <View style={s.kingInfo}>
                  <Text style={s.dynastyTag}>{item.category} · {item.era}</Text>
                  <View style={s.nameRow}>
                    <Text style={s.kingName}>{item.title}</Text>
                    {item.importance ? <Text style={s.stars}>{starsFor(item.importance)}</Text> : null}
                  </View>
                  <Text style={s.kingOneLiner} numberOfLines={2}>{item.oneLiner}</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={s.kingRow}
                onPress={() => navigation.navigate('KingDetail', { dynasty: item.dynastyKey, order: item.order })}
                activeOpacity={0.7}
              >
                <View style={s.orderBadge}>
                  <Text style={s.orderText}>{typeof item.order === 'number' ? item.order : '·'}</Text>
                </View>
                <View style={s.kingInfo}>
                  <Text style={s.dynastyTag}>{item.dynastyTitle}</Text>
                  <View style={s.nameRow}>
                    <Text style={s.kingName}>{item.name}</Text>
                    {item.importance ? <Text style={s.stars}>{starsFor(item.importance)}</Text> : null}
                  </View>
                  <View style={s.metaRow}>
                    <Text style={s.kingYears}>{item.reignStart} ~ {item.reignEnd}</Text>
                    {item.keyword ? <Text style={s.keywordTag}>{item.keyword}</Text> : null}
                  </View>
                  <Text style={s.kingOneLiner} numberOfLines={2}>{item.oneLiner}</Text>
                </View>
              </TouchableOpacity>
            );
          }

          if (mode === 'topic') {
            const topics = getTopicsByCategory(item.key);
            return (
              <TouchableOpacity
                style={s.dynastyCard}
                onPress={() => navigation.navigate('TopicList', { category: item.key })}
                activeOpacity={0.85}
              >
                <Text style={s.categoryIcon}>{item.icon}</Text>
                <View style={s.dynastyTextWrap}>
                  <Text style={s.dynastyTitle}>{item.title}</Text>
                  <Text style={s.groupSubLabel}>{topics.length}개 항목</Text>
                </View>
                <Text style={s.dynastyArrow}>›</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              style={s.dynastyCard}
              onPress={() =>
                item.type === 'group'
                  ? navigation.navigate('Group', { group: item.key })
                  : navigation.navigate('Dynasty', { dynasty: item.key })
              }
              activeOpacity={0.85}
            >
              <View style={s.dynastyTextWrap}>
                <Text style={s.dynastyTitle}>{item.title}</Text>
                <Text style={s.dynastyPeriod}>{item.period}</Text>
                {item.type === 'group' && (
                  <Text style={s.groupSubLabel}>{item.children.length}개국 함께 보기</Text>
                )}
              </View>
              {item.type === 'dynasty' && (
                <View style={s.dynastyCountBadge}>
                  <Text style={s.dynastyCountNum}>{item.data.kings.length}</Text>
                  <Text style={s.dynastyCountLabel}>왕</Text>
                </View>
              )}
              <Text style={s.dynastyArrow}>›</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3ecdc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  listContent: { padding: 20, paddingBottom: 48 },

  appTitle: { fontSize: 32, fontWeight: '800', color: '#2b2118', marginTop: 8 },
  appSubtitle: { fontSize: 16, color: '#7a6f5d', marginTop: 6, marginBottom: 18 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#faf6ec',
    borderWidth: 1, borderColor: '#e2d6bc',
    borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    marginBottom: 22,
  },
  searchIcon: { fontSize: 17 },
  searchInput: { flex: 1, fontSize: 17, color: '#2b2118' },
  clearIcon: { fontSize: 17, color: '#a8997a', paddingHorizontal: 4 },

  hotCard: {
    backgroundColor: '#a83c32',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  hotBadge: { fontSize: 14, fontWeight: '700', color: '#ffe3b3', marginBottom: 8 },
  hotTitle: { fontSize: 20, fontWeight: '800', color: '#fff8ee', lineHeight: 27 },
  hotDesc: { fontSize: 14, color: '#f3d9cf', marginTop: 8, lineHeight: 20 },

  quizCard: {
    backgroundColor: '#3d6b4a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  quizBadge: { fontSize: 14, fontWeight: '700', color: '#cfe8d6', marginBottom: 8 },
  quizTitle: { fontSize: 19, fontWeight: '800', color: '#fff8ee', lineHeight: 26 },
  quizDesc: { fontSize: 14, color: '#d7ecdc', marginTop: 8 },

  modeTabs: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  modeTab: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#e2d6bc', backgroundColor: '#faf6ec',
  },
  modeTabActive: { backgroundColor: '#b8912f', borderColor: '#b8912f' },
  modeTabText: { fontSize: 15, fontWeight: '700', color: '#8a7550' },
  modeTabTextActive: { color: '#fff8ee' },

  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#2b2118', marginBottom: 4 },
  sectionSub: { fontSize: 15, color: '#7a6f5d', marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#7a6f5d', textAlign: 'center', marginTop: 24 },

  // 왕조/주제 카탈로그 카드
  dynastyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf6ec',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2d6bc',
    padding: 20,
    marginBottom: 12,
    gap: 14,
  },
  categoryIcon: { fontSize: 28 },
  dynastyTextWrap: { flex: 1 },
  dynastyTitle: { fontSize: 23, fontWeight: '800', color: '#2b2118' },
  dynastyPeriod: { fontSize: 15, color: '#a8471f', fontWeight: '600', marginTop: 4 },
  groupSubLabel: { fontSize: 13, color: '#a8997a', marginTop: 4 },
  dynastyCountBadge: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#b8912f', borderRadius: 14,
    width: 52, height: 52,
  },
  dynastyCountNum: { color: '#fff8ee', fontWeight: '800', fontSize: 18, lineHeight: 22 },
  dynastyCountLabel: { color: '#fff8ee', fontSize: 11, marginTop: -2 },
  dynastyArrow: { fontSize: 26, color: '#c7ba98', fontWeight: '700' },

  // 검색 결과 행 (왕 + 주제 공용)
  kingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#faf6ec',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2d6bc',
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  orderBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#b8912f',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  topicBadge: { backgroundColor: '#a83c32' },
  orderText: { color: '#fff8ee', fontWeight: '800', fontSize: 16 },
  kingInfo: { flex: 1 },
  dynastyTag: { fontSize: 12, fontWeight: '700', color: '#a8471f', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  kingName: { fontSize: 21, fontWeight: '800', color: '#2b2118' },
  stars: { fontSize: 13, color: '#b8912f', letterSpacing: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' },
  kingYears: { fontSize: 14, color: '#a8471f', fontWeight: '600' },
  keywordTag: {
    fontSize: 12, color: '#8a7550', backgroundColor: '#efe4cc',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden',
  },
  kingOneLiner: { fontSize: 15, color: '#5a5142', marginTop: 6, lineHeight: 21 },
});
