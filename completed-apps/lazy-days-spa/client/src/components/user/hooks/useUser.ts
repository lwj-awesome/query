import { AxiosResponse } from 'axios';
import { useQuery, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

// query function
async function getUser(
  user: User | null,
  signal: AbortSignal
): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      signal, // abortSignal from React Query
      headers: getJWTHeader(user),
    }
  );

  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export function useUser(): UseUser {
  const queryClient = useQueryClient();

  // call useQuery to update user data from server
  const { data: user } = useQuery<User>(
    queryKeys.user,
    ({ signal }) => getUser(user, signal),
    // 변환 후 사용자를 유지하기 위한 대체 쿼리 기능
    // (https://www.udemy.com/course/learn-react-query/learn/#1794/17098438/ 참조)
    // 토론용)
    // ({signal }) => {
    // conststoredUser = getStoredUser();
    // concurrentUser = 사용자 ?? 저장된 사용자;
    // getUser(현재 사용자, 신호)를 반환합니다.
    // },
    {
      // populate initially with user in localStorage
      initialData: getStoredUser,

      // 참고: onSuccess는 성공적인 쿼리 함수 완료 시 모두 호출됩니다.
      // * 및 * 쿼리 클라이언트에 표시됩니다.setQueryData
      // onSuccess에 대한 '수신' 인수는 다음과 같습니다.
      // - queryClient에서 호출된 경우 null입니다.setQueryData in clearUser()
      // - queryClient에서 호출된 경우 사용자.updateUser()에서 setQueryData()
      // getUser 쿼리 함수 호출에서 *또는*
      onSuccess: (received: null | User) => {
        if (!received) {
          clearStoredUser();
        } else {
          setStoredUser(received);
        }
      },
    }
  );

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // update the user
    queryClient.setQueryData(queryKeys.user, newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    // reset user to null
    queryClient.setQueryData(queryKeys.user, null);

    // remove user appointments query
    queryClient.removeQueries([queryKeys.appointments, queryKeys.user]);
  }

  return { user, updateUser, clearUser };
}
