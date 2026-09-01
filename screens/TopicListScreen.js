import { View, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import AppText from '../components/AppText';
import { TOPIC_CATEGORIES, getTopicsByCategory, starsFor } from '../content/registry';

export default function TopicListScreen({ route, navigation }) {
  const { category } = route.params;
  const categoryInfo = TOPIC_CATEGORIES.find((c) => c.key === category);
  const topics = getTopicsByCategory(category);

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <AppText style={s.backText}>← 주제 목록</AppText>
            </TouchableOpacity>
            <AppText style={s.title}>{categoryInfo?.icon} {categoryInfo?.title}</AppText>
            <AppText style={s.period}>{topics.length}개 항목</AppText>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.topicRow}
            onPress={() => navigation.navigate('TopicDetail', { id: item.id })}
            activeOpacity={0.7}
          >
            <View style={s.topicInfo}>
              <AppText style={s.eraTag}>{item.era}{item.yearStart ? ` · ${item.yearStart}` : ''}{item.yearEnd && item.yearEnd !== item.yearStart ? `~${item.yearEnd}` : ''}</AppText>
              <View style={s.nameRow}>
                <AppText style={s.topicTitle}>{item.title}</AppText>
                {item.importance ? <AppText style={s.stars}>{starsFor(item.importance)}</AppText> : null}
              </View>
              <AppText style={s.topicOneLiner} numberOfLines={2}>{item.oneLiner}</AppText>
            </View>
          </TouchableOpacity>
        )}
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

  backBtn: { paddingVertical: 8, marginBottom: 6 },
  backText: { fontSize: 17, fontWeight: '700', color: '#a8471f' },

  title: { fontSize: 30, fontWeight: '800', color: '#2b2118', marginTop: 4 },
  period: { fontSize: 16, color: '#7a6f5d', marginTop: 6, marginBottom: 20 },

  topicRow: {
    backgroundColor: '#faf6ec',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2d6bc',
    padding: 16,
    marginBottom: 10 },
  topicInfo: { flex: 1 },
  eraTag: { fontSize: 12, fontWeight: '700', color: '#a8471f', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  topicTitle: { fontSize: 21, fontWeight: '800', color: '#2b2118' },
  stars: { fontSize: 13, color: '#b8912f', letterSpacing: 1 },
  topicOneLiner: { fontSize: 15, color: '#5a5142', marginTop: 6, lineHeight: 21 } });
