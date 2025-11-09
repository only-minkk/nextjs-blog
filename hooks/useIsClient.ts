// // hooks/useIsClient.ts
// import { useSyncExternalStore } from "react";

// /** SSR에선 false, 클라이언트 하이드레이션 후 바로 true */
// export function useIsClient() {
//   return useSyncExternalStore(
//     // subscribe: 즉시 콜백을 불러 스냅샷을 재평가시키고, 구독 해제는 noop
//     (notify) => {
//       notify();
//       return () => {};
//     },
//     // getSnapshot (client)
//     () => true,
//     // getServerSnapshot (server)
//     () => false
//   );
// }
