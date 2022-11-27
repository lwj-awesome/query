import { useQuery, useQueryClient } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}
export function useTreatments(): Treatment[] {
  // 이즈로딩 그런거 조건부 돌렸었는데
  // 애초에 유즈쿼리를 쓰는 곳에서 빈 배열로 초기값을 잡아주면 된다.
  const fallback = [];
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments);
  return data;
}
// 다음 데이터를 미리 불러오기 위한 프리패칭 커스텀 훅스
// 빈 배열로 초기화를 시켜주면 없다는 말을 안함
// 근데 빈 배열이 먼저 렌더링 되니까, 미리 불러오는거임.
export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery(queryKeys.treatments, getTreatments);
}
/**
 * queryKeys들을 변수화, 헷갈릴 일이 없음. 쿼리키는 무조건 있어야함.
 * 쿼리키가 있어야, 리액트 쿼리가 데이터가 패칭 되는지 아닌지 확인을 함 
 * useEffect의 디펜던시와 비슷하게 동작을 함.
 
 
 * 리액트 쿼리로 불러오는 데이터의 interface 설정
export interface Treatment extends Id {
  name: string;
  durationInMinutes: number;
  image: Image;
  description: string;
}
 */
