import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@khistory_font_scale';

export const FONT_SCALE_LEVELS = [
  { key: 'normal', label: '보통', scale: 1.0 },
  { key: 'large', label: '크게', scale: 1.15 },
  { key: 'xlarge', label: '아주 크게', scale: 1.3 },
];

const DEFAULT_SCALE = 1.0;

const FontScaleContext = createContext({
  scale: DEFAULT_SCALE,
  levelKey: 'normal',
  setLevelKey: () => {},
  loaded: false,
});

export function FontScaleProvider({ children }) {
  const [levelKey, setLevelKeyState] = useState('normal');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved && FONT_SCALE_LEVELS.some((l) => l.key === saved)) {
          setLevelKeyState(saved);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  function setLevelKey(key) {
    setLevelKeyState(key);
    AsyncStorage.setItem(STORAGE_KEY, key).catch(() => {});
  }

  const level = FONT_SCALE_LEVELS.find((l) => l.key === levelKey) || FONT_SCALE_LEVELS[0];

  return (
    <FontScaleContext.Provider value={{ scale: level.scale, levelKey, setLevelKey, loaded }}>
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale() {
  return useContext(FontScaleContext);
}
