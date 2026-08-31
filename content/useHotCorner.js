import { useEffect, useState } from 'react';
import localFallback from './hotcorner.json';

// GitHub에 올려둔 원본 파일 — 사용자가 GitHub 웹사이트에서 이 파일만 직접 고치면
// 앱을 다시 빌드/배포하지 않아도 다음에 앱을 열 때 새 내용이 반영된다.
const REMOTE_URL = 'https://raw.githubusercontent.com/Kim-KH/khistory/main/content/hotcorner.json';

// 세션 안에서는 한 번만 원격 요청 — 화면을 오갈 때마다 다시 불러오지 않도록 모듈
// 스코프에 캐시해둔다. 앱을 완전히 껐다 켜면 다시 최신 내용을 시도한다.
let cachedItems = null;
let cachedSource = null;

function sortNewestFirst(items) {
  return [...items].sort((a, b) => (b.addedDate || '').localeCompare(a.addedDate || ''));
}

export function useHotCornerItems() {
  const [state, setState] = useState(() =>
    cachedItems
      ? { items: cachedItems, loading: false, source: cachedSource }
      : { items: sortNewestFirst(localFallback.items), loading: true, source: 'local' }
  );

  useEffect(() => {
    if (cachedItems) return;
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    fetch(REMOTE_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('네트워크 응답 오류');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!data || !Array.isArray(data.items) || data.items.length === 0) {
          throw new Error('형식이 올바르지 않음');
        }
        const items = sortNewestFirst(data.items);
        cachedItems = items;
        cachedSource = 'remote';
        setState({ items, loading: false, source: 'remote' });
      })
      .catch(() => {
        if (cancelled) return;
        // 오프라인이거나 원격 파일에 문제가 있으면, 앱에 내장된(마지막 배포 시점) 내용으로 대체한다.
        const items = sortNewestFirst(localFallback.items);
        cachedItems = items;
        cachedSource = 'local';
        setState({ items, loading: false, source: 'local' });
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
