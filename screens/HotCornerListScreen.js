import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useHotCornerItems } from '../content/useHotCorner';

function itemTitle(item) {
  return item.movieFacts?.title || item.issueFacts?.title || '핫코너';
}
function itemSummary(item) {
  return item.movieFacts?.summary || item.issueFacts?.summary || '';
}

export default function HotCornerListScreen({ navigation }) {
  const { items, loading, source } = useHotCornerItems();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← 홈</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <>
            <Text style={s.badge}>🔥 핫코너</Text>
            <Text style={s.pageTitle}>요즘 화제와 역사</Text>
            <Text style={s.pageSub}>
              {loading
                ? '최신 내용을 불러오는 중...'
                : source === 'local'
                ? '오프라인 상태라 마지막으로 저장된 내용을 보여드려요.'
                : `${items.length}개의 이야기`}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('HotCornerDetail', { item })}
          >
            <Text style={s.cardDate}>{item.addedDate}</Text>
            <Text style={s.cardTitle}>{itemTitle(item)}</Text>
            <Text style={s.cardTrigger} numberOfLines={2}>{item.trigger}</Text>
            <Text style={s.cardSummary} numberOfLines={2}>{itemSummary(item)}</Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 4, alignSelf: 'flex-start' },
  backText: { fontSize: 17, fontWeight: '700', color: '#a8471f' },

  listContent: { padding: 20, paddingBottom: 48 },
  badge: { fontSize: 14, fontWeight: '700', color: '#a83c32', marginBottom: 8 },
  pageTitle: { fontSize: 30, fontWeight: '800', color: '#2b2118' },
  pageSub: { fontSize: 15, color: '#7a6f5d', marginTop: 8, marginBottom: 20 },

  card: {
    backgroundColor: '#faf6ec',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2d6bc',
    padding: 18,
    marginBottom: 14,
  },
  cardDate: { fontSize: 13, fontWeight: '700', color: '#b8912f', marginBottom: 6 },
  cardTitle: { fontSize: 21, fontWeight: '800', color: '#2b2118', lineHeight: 28 },
  cardTrigger: { fontSize: 14, color: '#a8471f', marginTop: 8, lineHeight: 20 },
  cardSummary: { fontSize: 15, color: '#5a5142', marginTop: 8, lineHeight: 22 },
});
