import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useQuery } from 'react-query';

import type { Staff } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { filterByTreatment } from '../utils';

async function getStaff(): Promise<Staff[]> {
  const { data } = await axiosInstance.get('/staff');
  console.log('data???', data);
  return data;
}

interface UseStaff {
  staff: Staff[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
}
// TODO: 사용 미사용 혹은 셀렉트 선택에 따라 달라지는 데이터에 적용해볼만한 훅스
export function useStaff(): UseStaff {
  // for filtering staff by treatment
  const [filter, setFilter] = useState('all');
  // const selectFn = (unfilteredStaff) =>
  //   filterByTreatment(unfilteredStaff, filter);

  // 유즈쿼리 안 select에 data(패칭된)가 들어있음. 함수의 파라미터는 저 데이터를 받음

  const selectFn = useCallback((x: Staff[]) => filterByTreatment(x, filter), [
    filter,
  ]);
  // const selectFn = (x) => filterByTreatment(x, filter);
  console.log(selectFn);
  const test = () => {
    return [
      {
        id: 1,
        name: 'Divya',
        treatmentNames: ['facial', 'scrub'],
        image: {
          fileName: 'divya.jpg',
          authorName: 'Pradeep Ranjan',
          authorLink:
            'https://unsplash.com/@tinywor1d?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText',
          platformName: 'Unsplash',
          platformLink: 'https://unsplash.com/',
        },
      },
    ];
  };
  const fallback = [];
  const { data: staff = fallback } = useQuery(queryKeys.staff, getStaff, {
    // 셀렉트 함수는 데이터가 변하고 함수가 변해야지만 재실행함. 메모이제이션 최적화가 되어 잇음
    // selectFn을 useCallback과 함께 사용해야함.
    // 라디오 그룹에서 넘어온 (바뀐 value)가 selectFn 함수를 재실행하면 select 옵션이 실행
    // 넘어오는 데이터의 형식과 일치하는 데이터를 return 하는 함수만 올 수 있음.
    select: filter !== 'all' ? selectFn : undefined,
    // select: (x) => filterByTreatment(x, filter),
  });

  return { staff, filter, setFilter };
}

// 알아서 리패칭은 빈번하게 변하지 않는 데이터에 넣어주는게 좋음.
// 만료된 데이터를 리페칭함 ( 윈도우가 포커스 되었을시에)
// 근데 리액트 쿼리는 데이터 받자마자 바로 만료 시켜버림 (따로 설정안하면)
// stale 옵션으로 리페치를 막을 수도 잇음.
