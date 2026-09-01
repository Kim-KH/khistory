import { View, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import AppText from '../components/AppText';
import { getDynasty, starsFor } from '../content/registry';

export default function DynastyScreen({ route, navigation }) {
  const { dynasty, from, periodOverride, crossLink } = route.params;
  const dynastyInfo = getDynasty(dynasty);

  if (!dynastyInfo) {
    return (
      <SafeAreaView style={s.safe}>
        <AppText style={s.notFound}>왕조 정보를 찾을 수 없습니다.</AppText>
      </SafeAreaView>
    );
  }

  const kings = from ? dynastyInfo.data.kings.filter((k) => k.order >= from) : dynastyInfo.data.kings;

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={kings}
        keyExtractor={(item, index) => `${item.order}-${index}`}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <AppText style={s.backText}>← 시대 목록</AppText>
            </TouchableOpacity>
            <AppText style={s.title}>{dynastyInfo.title}</AppText>
            <AppText style={s.period}>{periodOverride || dynastyInfo.period} · {kings.length}왕</AppText>
            {crossLink && (
              <TouchableOpacity
                style={s.crossLink}
                onPress={() => navigation.navigate('Group', { group: crossLink.group })}
                activeOpacity={0.7}
              >
                <AppText style={s.crossLinkText}>{crossLink.label} →</AppText>
              </TouchableOpacity>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.kingRow}
            onPress={() => navigation.navigate('KingDetail', { dynasty, order: item.order })}
            activeOpacity={0.7}
          >
            <View style={s.orderBadge}>
              <AppText style={s.orderText}>{typeof item.order === 'number' ? item.order : '·'}</AppText>
            </View>
            <View style={s.kingInfo}>
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
  notFound: { fontSize: 18, color: '#2b2118', padding: 24 },
  listContent: { padding: 20, paddingBottom: 48 },

  backBtn: { paddingVertical: 8, marginBottom: 6 },
  backText: { fontSize: 17, fontWeight: '700', color: '#a8471f' },

  title: { fontSize: 30, fontWeight: '800', color: '#2b2118', marginTop: 4 },
  period: { fontSize: 16, color: '#7a6f5d', marginTop: 6, marginBottom: 12 },
  crossLink: {
    backgroundColor: '#efe4cc', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14,
    marginBottom: 20, alignSelf: 'flex-start' },
  crossLinkText: { fontSize: 14, color: '#a8471f', fontWeight: '700' },

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
  orderText: { color: '#fff8ee', fontWeight: '800', fontSize: 16 },
  kingInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  kingName: { fontSize: 21, fontWeight: '800', color: '#2b2118' },
  stars: { fontSize: 13, color: '#b8912f', letterSpacing: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' },
  kingYears: { fontSize: 14, color: '#a8471f', fontWeight: '600' },
  keywordTag: {
    fontSize: 12, color: '#8a7550', backgroundColor: '#efe4cc',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  kingOneLiner: { fontSize: 15, color: '#5a5142', marginTop: 6, lineHeight: 21 } });
