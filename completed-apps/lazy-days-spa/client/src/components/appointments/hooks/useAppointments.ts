import dayjs from 'dayjs';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from '../../user/hooks/useUser';
import { AppointmentDateMap } from '../types';
import { getAvailableAppointments } from '../utils';
import { getMonthYearDetails, getNewMonthYear, MonthYear } from './monthYear';

// common options for both useQuery and prefetchQuery
const commonOptions = {
  staleTime: 0,
  cacheTime: 300000, // 5 minutes
};

// query function for useQuery call
async function getAppointments(
  year: string,
  month: string
): Promise<AppointmentDateMap> {
  const { data } = await axiosInstance.get(`/appointments/${year}/${month}`);
  return data;
}

// identity function so select won't show stale data
// see this Q&A for more details:
// https://www.udemy.com/course/learn-react-query/learn/#questions/18249892/
function identity<T>(value: T): T {
  return value;
}

// types for hook return object
interface UseAppointments {
  appointments: AppointmentDateMap;
  monthYear: MonthYear;
  updateMonthYear: (monthIncrement: number) => void;
  showAll: boolean;
  setShowAll: Dispatch<SetStateAction<boolean>>;
}

// 이 후크의 용도:
// 1. 사용자가 선택한 현재 월/년(일명 월년)을 추적합니다.
// 1a. 상태를 업데이트하는 방법을 제공합니다.
// 2. 해당 월의 약속을 반환합니다.
// 2a. 약속 날짜 맵 형식으로 반환(일별로 색인화된 약속 배열)
// 2b. 인접한 달의 약속을 미리 가져옵니다.년
// 3. 필터 상태 추적(모든 약속/사용 가능한 약속)
// 3a. 현재 월에 해당하는 약속만 반환합니다. 연도
export function useAppointments(): UseAppointments {
  /** ****************** START 1: monthYear state *********************** */
  // 현재 날짜에 대한 월 연도 가져오기(기본 월 연도 상태의 경우)
  const currentMonthYear = getMonthYearDetails(dayjs());

  // 현재 월을 추적할 state 사용자가 선택한 연도
  // 후크 반환 개체에서 상태 값이 반환됨
  const [monthYear, setMonthYear] = useState(currentMonthYear);

  // setter에서 사용자가 월 보기를 변경할 때 월년 객체 상태를 업데이트합니다.
  // 후크 반환 개체에서 반환됨
  function updateMonthYear(monthIncrement: number): void {
    setMonthYear((prevData) => getNewMonthYear(prevData, monthIncrement));
  }
  /** ****************** END 1: monthYear state ************************* */
  /** ****************** START 2: filter appointments  ****************** */
  // 모두 또는 사용 가능한 약속만 표시하도록 약속을 필터링하기 위한 상태 및 기능
  const [showAll, setShowAll] = useState(false);

  // 여기서 가져오기 기능 getAvailableAppointments가 필요합니다.
  // 사용자가 Available Appointments를 사용할 수 있도록 전달해야 합니다.
  // 로그인한 사용자가 예약한 약속(흰색)
  const { user } = useUser();

  const selectFn = useCallback((data) => getAvailableAppointments(data, user), [
    user,
  ]);
  /** ****************** END 2: filter appointments  ******************** */
  /** ****************** START 3: useQuery  ***************************** */
  // 현재 월의 약속에 대해 쿼리 호출을 사용

  // 월년이 변경되는 다음 달에 미리 가져오기
  const queryClient = useQueryClient();
  useEffect(() => {
    // assume increment of one month
    const nextMonthYear = getNewMonthYear(monthYear, 1);
    queryClient.prefetchQuery(
      [queryKeys.appointments, nextMonthYear.year, nextMonthYear.month],
      () => getAppointments(nextMonthYear.year, nextMonthYear.month),
      commonOptions
    );
  }, [queryClient, monthYear]);

  // 1. 약속은 약속 날짜 맵(일이 있는 개체)입니다.
  // 속성 및 해당 날짜에 대한 약속 배열 값)
  //
  // 2. getAppointments 쿼리 기능을 사용하려면 month Year가 필요합니다.연도와
  // 월년월
  const fallback = {};

  const { data: appointments = fallback } = useQuery(
    [queryKeys.appointments, monthYear.year, monthYear.month],
    () => getAppointments(monthYear.year, monthYear.month),
    {
      // 여기서 'undefined'를 사용할 수 없습니다. ID 함수를 사용해야 합니다.
      // 자세한 내용은 다음 Q&A를 참조하십시오.
      // https://www.udemy.com/course/learn-react-query/learn/#https/https9892/

      select: showAll ? (data) => identity<AppointmentDateMap>(data) : selectFn,
      ...commonOptions,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchInterval: 60000, // 60 seconds
    }
  );
  console.log('ddd', appointments);

  /** ****************** END 3: useQuery  ******************************* */

  return { appointments, monthYear, updateMonthYear, showAll, setShowAll };
}
