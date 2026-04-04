'use client';

import { Skeleton, useColorModeValue } from '@chakra-ui/react';

const DarkSkeleton = ({ children, isLoaded, ...props }: any) => {
  const startColor = useColorModeValue('gray.100', 'rgba(255, 255, 255, 0.05)');
  const endColor = useColorModeValue('gray.200', 'rgba(255, 255, 255, 0.1)');

  return (
    <Skeleton
      isLoaded={isLoaded}
      startColor={startColor}
      endColor={endColor}
      speed={1.5}
      borderRadius="3xl"
      {...props}
    >
      {children}
    </Skeleton>
  );
};

export default DarkSkeleton;
