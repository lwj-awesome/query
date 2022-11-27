import { Spinner, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useIsFetching, useIsMutating } from 'react-query';

export function Loading(): ReactElement {
  // 아래의 훅스로 데이터가 패칭되고 있음을, 로딩 중임을, 불린 값으로 얻을 수 있음
  // 아래 훅스를 통해서 로딩을 띄울 수 잇음 (전역에서)
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  // 윈도우에 포커스하면, 기본적으로 리페칭이 되어버림 리액트쿼리의 기본기능
  const display = isFetching || isMutating ? 'inherit' : 'none';

  return (
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="olive.200"
      color="olive.800"
      role="status"
      position="fixed"
      zIndex="9999"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      display={display}
    >
      <Text display="none">Loading...</Text>
    </Spinner>
  );
}
