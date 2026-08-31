import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { getGroup, getDynasty, resolveChild } from '../content/registry';

export default function GroupScreen({ route, navigation }) {
  const { group } = route.params;
  const groupInfo = getGroup(group);

  if (!groupInfo) {
    return (
      <SafeAreaView style={s.safe}>
        <Text style={s.notFound}>카테고리를 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  const children = groupInfo.children
    .map((raw) => {
      const child = resolveChild(raw);
      const dynasty = getDynasty(child.key);
      if (!dynasty) return null;
      const kings = child.from ? dynasty.data.kings.filter((k) => k.order >= child.from) : dynasty.data.kings;
      return {
        ...child,
        title: dynasty.title,
        period: child.periodOverride || dynasty.period,
        count: kings.length,
      };
    })
    .filter(Boolean);

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={children}
        keyExtractor={(item) => item.key}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <Text style={s.backText}>← 시대 목록</Text>
            </TouchableOpacity>
            <Text style={s.title}>{groupInfo.title}</Text>
            <Text style={s.period}>{groupInfo.period}</Text>
            <Text style={s.hint}>나라를 선택하세요</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() =>
              navigation.navigate('Dynasty', {
                dynasty: item.key,
                from: item.from,
                periodOverride: item.periodOverride,
                crossLink: item.crossLink,
              })
            }
            activeOpacity={0.85}
          >
            <View style={s.textWrap}>
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardPeriod}>{item.period}</Text>
            </View>
            <View style={s.countBadge}>
              <Text style={s.countNum}>{item.count}</Text>
              <Text style={s.countLabel}>왕</Text>
            </View>
            <Text style={s.arrow}>›</Text>
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
  notFound: { fontSize: 18, color: '#2b2118', padding: 24 },
  listContent: { padding: 20, paddingBottom: 48 },

  backBtn: { paddingVertical: 8, marginBottom: 6 },
  backText: { fontSize: 17, fontWeight: '700', color: '#a8471f' },

  title: { fontSize: 30, fontWeight: '800', color: '#2b2118', marginTop: 4 },
  period: { fontSize: 16, color: '#7a6f5d', marginTop: 6 },
  hint: { fontSize: 15, color: '#a8997a', marginTop: 14, marginBottom: 16 },

  card: {
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
  textWrap: { flex: 1 },
  cardTitle: { fontSize: 23, fontWeight: '800', color: '#2b2118' },
  cardPeriod: { fontSize: 15, color: '#a8471f', fontWeight: '600', marginTop: 4 },
  countBadge: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#b8912f', borderRadius: 14,
    width: 52, height: 52,
  },
  countNum: { color: '#fff8ee', fontWeight: '800', fontSize: 18, lineHeight: 22 },
  countLabel: { color: '#fff8ee', fontSize: 11, marginTop: -2 },
  arrow: { fontSize: 26, color: '#c7ba98', fontWeight: '700' },
});
