import { createStandaloneToast } from '@chakra-ui/react';
import { QueryClient } from 'react-query';

const toast = createStandaloneToast();

function queryErrorHandler(error: unknown): void {
  // error is type unknown because in js, anything can be an error (e.g. throw(5))
  const title =
    error instanceof Error ? error.message : 'error connecting to server';

  // prevent duplicate toasts
  toast.closeAll();
  toast({ title, status: 'error', variant: 'subtle', isClosable: true });
}
// 에러 핸들링을 쿼리 설정 부분에서 디폴트 값으로 넣어주면 됨.
// 에러 핸들러를 각 유즈쿼리에 넣어줄 필요가 없음.
export function generateQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 기본적으로 캐싱 처리를 해주는 것임. 데이터가 빈번하게 변하지 않는다면 쿼리즈 옵션으로
        // 캐싱 처리를 할 수 있음 (빈번하게 업뎃을 해야한다면 밑 3개의 옵션을 true로 주고 쓰면 됨)
        onError: queryErrorHandler,
        staleTime: 600000, // 10 minutes
        cacheTime: 900000, // default cacheTime is 5 minutes; doesn't make sense for staleTime to exceed cacheTime
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: {
        onError: queryErrorHandler,
      },
    },
  });
}

export const queryClient = generateQueryClient();

// //////////////////////////////////////////////////////////
// START: alternative way to specify global error handler
// for details, see
// https://www.udemy.com/course/learn-react-query/learn/lecture/33911646#overview

// import { createStandaloneToast } from '@chakra-ui/react';
// import { QueryCache, QueryClient } from 'react-query';

// import { theme } from '../theme';

// const toast = createStandaloneToast({ theme });

// function queryErrorHandler(error: unknown): void {
//   // error is type unknown because in js, anything can be an error (e.g. throw(5))
//   const title =
//     error instanceof Error ? error.message : 'error connecting to server';

//   toast({ title, status: 'error', variant: 'subtle', isClosable: true });
// }

// export function generateQueryClient(): QueryClient {
//   return new QueryClient({
//     // from https://tkdodo.eu/blog/react-query-error-handling#the-global-callbacks
//     queryCache: new QueryCache({
//       onError: queryErrorHandler,
//     }),
//     defaultOptions: {
//       queries: {
//         staleTime: 600000, // 10 minutes
//         cacheTime: 900000, // default cacheTime is 5 minutes; doesn't make sense for staleTime to exceed cacheTime
//         refetchOnMount: false,
//         refetchOnWindowFocus: false,
//         refetchOnReconnect: false,
//       },
//       mutations: {
//         onError: queryErrorHandler,
//       },
//     },
//   });
// }

// export const queryClient = generateQueryClient();

// END: alternative way to specify global error handler
// //////////////////////////////////////////////////////////
