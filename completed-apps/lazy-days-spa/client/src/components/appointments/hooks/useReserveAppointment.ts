import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from '../../user/hooks/useUser';

async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? 'replace' : 'add';
  const patchData = [{ op: patchOp, path: '/userId', value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}
// Alternate typescript annotation
// For more details, see
// https://www.udemy.com/course/learn-react-query/learn/#questions/18259670/
//
// type AppointmentMutationFunction = (appointment: Appointment) => void;
//
// export function useReserveAppointment(): AppointmentMutationFunction {

export function useReserveAppointment(): UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
> {
  const { user } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();
  // 뮤테이션은 일회성이기 때문에, 캐싱이 없음. 리페치, isLoading, 없음. isFetching만 있음.
  const { mutate } = useMutation(
    (appointment: Appointment) => setAppointmentUser(appointment, user?.id),
    {
      onSuccess: () => {
        // appointmets 쿼리키를 가진 유즈쿼리를 무효화(stale)로 넘기고
        // 리페칭을 시켜버리는 것
        queryClient.invalidateQueries([queryKeys.appointments]);
        toast({
          title: 'You have reserved the appointment!',
          status: 'success',
        });
      },
    }
  );

  return mutate;
}
