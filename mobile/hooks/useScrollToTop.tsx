import { useCallback, RefObject } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, FlatList } from 'react-native';

// ScrollView 또는 FlatList의 ref 타입 정의
type ScrollableRef = RefObject<ScrollView> | RefObject<FlatList<any>>;

interface UseScrollToTopOptions {
  enabled?: boolean; // 스크롤 기능 활성화/비활성화
}

/**
 * 화면이 포커스될 때마다 스크롤을 맨 위로 이동시키는 React Native용 훅
 * @param scrollRef ScrollView 또는 FlatList의 ref
 * @param options 옵션 설정
 */
const useScrollToTop = (
  scrollRef: ScrollableRef,
  options: UseScrollToTopOptions = {}
) => {
  const { enabled = true } = options;

  useFocusEffect(
    useCallback(() => {
      if (!enabled || !scrollRef.current) {
        return;
      }

      // ScrollView의 경우
      if ('scrollTo' in scrollRef.current) {
        (scrollRef.current as ScrollView).scrollTo({
          y: 0,
          animated: true
        });
      }
      // FlatList의 경우
      else if ('scrollToOffset' in scrollRef.current) {
        (scrollRef.current as FlatList<any>).scrollToOffset({
          offset: 0,
          animated: true
        });
      }
    }, [enabled, scrollRef])
  );
};

/**
 * 간단한 버전 - ref 없이 사용하는 경우를 위한 훅
 * 화면이 포커스될 때 호출될 콜백을 제공
 */
export const useScrollToTopCallback = (
  callback: () => void,
  options: UseScrollToTopOptions = {}
) => {
  const { enabled = true } = options;

  useFocusEffect(
    useCallback(() => {
      if (enabled) {
        callback();
      }
    }, [enabled, callback])
  );
};

export default useScrollToTop; 