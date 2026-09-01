import { useMemo, useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import AppText from '../components/AppText';
import { CATALOG, TOPIC_CATEGORIES, getTopicsByCategory, searchEverything, starsFor, getGroupTotalKingCount } from '../content/registry';
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
            <View style={s.titleRow}>
              <View style={s.titleTextWrap}>
                <AppText style={s.appTitle}>한국사 한입</AppText>
                <AppText style={s.appSubtitle}>매일 조금씩, 크게 보고 편하게 듣는 역사</AppText>
              </View>
              <TouchableOpacity
                style={s.settingsBtn}
                onPress={() => navigation.navigate('Settings')}
                hitSlop={10}
              >
                <AppText style={s.settingsIcon}>Aa</AppText>
              </TouchableOpacity>
            </View>

            <View style={s.searchBox}>
              <AppText style={s.searchIcon}>🔍</AppText>
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
                  <AppText style={s.clearIcon}>✕</AppText>
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
                  <AppText style={s.hotBadge}>🔥 핫코너 · {hotCornerItems.length}개</AppText>
                  {latestHotCorner && (
                    <>
                      <AppText style={s.hotTitle}>
                        {latestHotCorner.movieFacts?.title || latestHotCorner.issueFacts?.title}
                      </AppText>
                      <AppText style={s.hotDesc}>{latestHotCorner.trigger}</AppText>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.quizCard}
                  onPress={() => navigation.navigate('QuizHome')}
                  activeOpacity={0.85}
                >
                  <AppText style={s.quizBadge}>📝 문제풀이</AppText>
                  <AppText style={s.quizTitle}>한국사능력검정시험 대비 문제 풀어보기</AppText>
                  <AppText style={s.quizDesc}>기본·심화 난이도 · 오답노트 자동 저장</AppText>
                </TouchableOpacity>

                <View style={s.modeTabs}>
                  <TouchableOpacity
                    style={[s.modeTab, mode === 'era' && s.modeTabActive]}
                    onPress={() => setMode('era')}
                  >
                    <AppText style={[s.modeTabText, mode === 'era' && s.modeTabTextActive]}>시대별로 (편년체)</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.modeTab, mode === 'topic' && s.modeTabActive]}
                    onPress={() => setMode('topic')}
                  >
                    <AppText style={[s.modeTabText, mode === 'topic' && s.modeTabTextActive]}>주제별로 (기전체)</AppText>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <AppText style={s.sectionTitle}>
              {isSearching ? `"${q}" 검색 결과` : mode === 'era' ? '시대별로 살펴보기' : '주제별로 살펴보기'}
            </AppText>
            {isSearching && <AppText style={s.sectionSub}>{searchResults.length}건 · 왕과 주제를 함께 찾았어요</AppText>}
          </>
        }
        ListEmptyComponent={
          isSearching ? <AppText style={s.emptyText}>검색 결과가 없습니다. 다른 단어로 찾아보세요.</AppText> : null
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
                  <AppText style={s.orderText}>{TOPIC_CATEGORIES.find((c) => c.key === item.category)?.icon}</AppText>
                </View>
                <View style={s.kingInfo}>
                  <AppText style={s.dynastyTag}>{item.category} · {item.era}</AppText>
                  <View style={s.nameRow}>
                    <AppText style={s.kingName}>{item.title}</AppText>
                    {item.importance ? <AppText style={s.stars}>{starsFor(item.importance)}</AppText> : null}
                  </View>
                  <AppText style={s.kingOneLiner} numberOfLines={2}>{item.oneLiner}</AppText>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={s.kingRow}
                onPress={() => navigation.navigate('KingDetail', { dynasty: item.dynastyKey, order: item.order })}
                activeOpacity={0.7}
              >
                <View style={s.orderBadge}>
                  <AppText style={s.orderText}>{typeof item.order === 'number' ? item.order : '·'}</AppText>
                </View>
                <View style={s.kingInfo}>
                  <AppText style={s.dynastyTag}>{item.dynastyTitle}</AppText>
                  <View style={s.nameRow}>
                    <AppText style={s.kingName}>{item.name}</AppText>
                    {item.importance ? <AppText style={s.stars}>{starsFor(item.importance)}</AppText> : null}
                  </View>
                  <View style={s.metaRow}>
                    <AppText style={s.kingYears}>{item.reignStart} ~ {item.reignEnd}</AppText>
                    {item.keyword ? <AppText style={s.keywordTag}>{item.keyword}</AppText> : null}
                  </View>
                  <AppText style={s.kingOneLiner} numberOfLines={2}>{item.oneLiner}</AppText>
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
                <AppText style={s.categoryIcon}>{item.icon}</AppText>
                <View style={s.dynastyTextWrap}>
                  <AppText style={s.dynastyTitle}>{item.title}</AppText>
                  <AppText style={s.groupSubLabel}>{topics.length}개 항목</AppText>
                </View>
                <AppText style={s.dynastyArrow}>›</AppText>
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
                <AppText style={s.dynastyTitle}>{item.title}</AppText>
                <AppText style={s.dynastyPeriod}>{item.period}</AppText>
                {item.type === 'group' && (
                  <AppText style={s.groupSubLabel}>{item.children.length}개국 함께 보기</AppText>
                )}
              </View>
              {item.type === 'dynasty' && (
                <View style={s.dynastyCountBadge}>
                  <AppText style={s.dynastyCountNum}>{item.data.kings.length}</AppText>
                  <AppText style={s.dynastyCountLabel}>왕</AppText>
                </View>
              )}
              {item.type === 'group' && (
                <View style={s.dynastyCountBadge}>
                  <AppText style={s.dynastyCountNum}>{getGroupTotalKingCount(item)}</AppText>
                  <AppText style={s.dynastyCountLabel}>왕</AppText>
                </View>
              )}
              <AppText style={s.dynastyArrow}>›</AppText>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  listContent: { padding: 20, paddingBottom: 48 },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleTextWrap: { flex: 1 },
  appTitle: { fontSize: 32, fontWeight: '800', color: '#2b2118', marginTop: 8 },
  appSubtitle: { fontSize: 16, color: '#7a6f5d', marginTop: 6, marginBottom: 18 },
  settingsBtn: {
    marginTop: 8,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#faf6ec', borderWidth: 1, borderColor: '#e2d6bc',
    alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 18, fontWeight: '800', color: '#b8912f' },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#faf6ec',
    borderWidth: 1, borderColor: '#e2d6bc',
    borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    marginBottom: 22 },
  searchIcon: { fontSize: 17 },
  searchInput: { flex: 1, fontSize: 17, color: '#2b2118' },
  clearIcon: { fontSize: 17, color: '#a8997a', paddingHorizontal: 4 },

  hotCard: {
    backgroundColor: '#a83c32',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20 },
  hotBadge: { fontSize: 14, fontWeight: '700', color: '#ffe3b3', marginBottom: 8 },
  hotTitle: { fontSize: 20, fontWeight: '800', color: '#fff8ee', lineHeight: 27 },
  hotDesc: { fontSize: 14, color: '#f3d9cf', marginTop: 8, lineHeight: 20 },

  quizCard: {
    backgroundColor: '#3d6b4a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20 },
  quizBadge: { fontSize: 14, fontWeight: '700', color: '#cfe8d6', marginBottom: 8 },
  quizTitle: { fontSize: 19, fontWeight: '800', color: '#fff8ee', lineHeight: 26 },
  quizDesc: { fontSize: 14, color: '#d7ecdc', marginTop: 8 },

  modeTabs: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  modeTab: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#e2d6bc', backgroundColor: '#faf6ec' },
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
    gap: 14 },
  categoryIcon: { fontSize: 28 },
  dynastyTextWrap: { flex: 1 },
  dynastyTitle: { fontSize: 23, fontWeight: '800', color: '#2b2118' },
  dynastyPeriod: { fontSize: 15, color: '#a8471f', fontWeight: '600', marginTop: 4 },
  groupSubLabel: { fontSize: 13, color: '#a8997a', marginTop: 4 },
  dynastyCountBadge: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#b8912f', borderRadius: 14,
    width: 52, height: 52 },
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
    gap: 14 },
  orderBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#b8912f',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0 },
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
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  kingOneLiner: { fontSize: 15, color: '#5a5142', marginTop: 6, lineHeight: 21 } });
