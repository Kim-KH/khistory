import { Text, StyleSheet } from 'react-native';
import { useFontScale } from '../content/useFontScale';

// 앱 전체 글자 크기 설정을 반영하는 공통 Text — 화면들은 RN의 Text 대신 이걸 쓴다.
export default function AppText(props) {
  const { style, ...rest } = props;
  const { scale } = useFontScale();

  if (scale === 1) {
    return <Text style={style} {...rest} />;
  }

  const flat = StyleSheet.flatten(style) || {};
  const scaledStyle = flat.fontSize ? [style, { fontSize: flat.fontSize * scale }] : style;

  return <Text style={scaledStyle} {...rest} />;
}
