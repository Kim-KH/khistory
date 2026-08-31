import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@khistory_wrong_answer_ids';

// 오답노트: 틀린 문제의 id만 기기에 저장해둔다. 로그인이 없는 앱이라 계정이 아닌
// '이 폰'에 저장되는 방식 — 나중에 그 문제를 맞히면 목록에서 자동으로 빠진다.
export function useWrongAnswers() {
  const [wrongIds, setWrongIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setWrongIds(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback((ids) => {
    setWrongIds(ids);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids)).catch(() => {});
  }, []);

  const markWrong = useCallback(
    (questionId) => {
      setWrongIds((prev) => {
        if (prev.includes(questionId)) return prev;
        const next = [...prev, questionId];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const markCorrect = useCallback(
    (questionId) => {
      setWrongIds((prev) => {
        if (!prev.includes(questionId)) return prev;
        const next = prev.filter((id) => id !== questionId);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const clearAll = useCallback(() => persist([]), [persist]);

  return { wrongIds, loaded, markWrong, markCorrect, clearAll };
}
