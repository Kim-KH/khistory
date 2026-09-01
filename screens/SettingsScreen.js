import { View, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import AppText from '../components/AppText';
import { useFontScale, FONT_SCALE_LEVELS } from '../content/useFontScale';

export default function SettingsScreen({ navigation }) {
  const { levelKey, setLevelKey, loaded } = useFontScale();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <AppText style={s.backText}>← 홈</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <AppText style={s.badge}>⚙️ 설정</AppText>
        <AppText style={s.title}>글자 크기</AppText>
        <AppText style={s.subtitle}>화면의 모든 글자 크기를 한 번에 바꿀 수 있어요.</AppText>

        {FONT_SCALE_LEVELS.map((level) => {
          const selected = level.key === levelKey;
          return (
            <TouchableOpacity
              key={level.key}
              style={[s.optionCard, selected && s.optionCardSelected]}
              activeOpacity={0.85}
              disabled={!loaded}
              onPress={() => setLevelKey(level.key)}
            >
              <View style={s.optionTextWrap}>
                <AppText style={[s.optionLabel, { fontSize: 17 * level.scale }]}>
                  {level.label}
                </AppText>
                <AppText style={s.optionSample}>가나다 ABC 123 — 한국사 한입</AppText>
              </View>
              {selected && <AppText style={s.checkMark}>✓</AppText>}
            </TouchableOpacity>
          );
        })}
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
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 4, alignSelf: 'flex-start' },
  backText: { fontSize: 17, fontWeight: '700', color: '#a8471f' },

  scroll: { padding: 20, paddingBottom: 48 },
  badge: { fontSize: 14, fontWeight: '700', color: '#a83c32', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#2b2118' },
  subtitle: { fontSize: 15, color: '#7a6f5d', marginTop: 8, marginBottom: 24 },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#faf6ec',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2d6bc',
    padding: 18,
    marginBottom: 14,
  },
  optionCardSelected: { borderColor: '#b8912f', backgroundColor: '#fff8ee' },
  optionTextWrap: { flex: 1 },
  optionLabel: { fontWeight: '800', color: '#2b2118', marginBottom: 6 },
  optionSample: { fontSize: 15, color: '#7a6f5d' },
  checkMark: { fontSize: 22, fontWeight: '800', color: '#b8912f', marginLeft: 12 },
});
