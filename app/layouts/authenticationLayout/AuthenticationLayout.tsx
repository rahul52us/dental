'use client';

import { Box, Flex, Image, Text, useBreakpointValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import React from 'react';

const zoomIn = keyframes`
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
`;

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box position="relative" minH="100vh" w="100%" overflow="hidden" bg="gray.50">
      {/* Decorative Background Blobs */}
      <Box
        position="absolute"
        top="-10%"
        left="-5%"
        w={{ base: "300px", md: "500px" }}
        h={{ base: "300px", md: "500px" }}
        bg="blue.300"
        opacity={0.4}
        filter="blur(100px)"
        rounded="full"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        w={{ base: "400px", md: "600px" }}
        h={{ base: "400px", md: "600px" }}
        bg="teal.300"
        opacity={0.3}
        filter="blur(120px)"
        rounded="full"
        zIndex={0}
      />
      <Box
        position="absolute"
        top="20%"
        right="20%"
        w="300px"
        h="300px"
        bg="orange.200"
        opacity={0.4}
        filter="blur(90px)"
        rounded="full"
        zIndex={0}
      />

      <Flex
        position="relative"
        zIndex={1}
        maxHeight="100vh"
        minHeight="100vh"
        direction={{ base: 'column', md: 'row' }}
        justifyContent="center"
        alignItems="center"
        px={{ base: 4, md: 8 }}
        py={{ base: 6, md: 10 }}
        gap={{ base: 8, md: 10 }}
      >
      {/* Left Section */}
      {!isMobile && (
        <Box
          position="relative"
          height={{ md: '85vh', xl: '90vh' }}
          width={{ md: '48%' }}
          maxW={{ md: '600px', xl: '650px' }}
          rounded="3xl"
          overflow="hidden"
          boxShadow="xl"
          bg="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Background Image */}
          <Image
            src="/dental-login-image.jpeg"
            alt="Dental Background"
            objectFit="contain"
            w="100%"
            h="100%"
            p={6}
          />
        </Box>
      )}

      {/* Right Section - Form */}
      <Box
        bg="white"
        p={{ base: 6, md: 12 }}
        rounded="3xl"
        width={{ base: '100%', md: '48%' }}
        maxW={{ md: '600px', xl: '650px' }}
        height={{ md: '85vh', xl: '90vh' }}
        boxShadow="xl"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        {children}
      </Box>
    </Flex>
    </Box>
  );
};

export default AuthenticationLayout;
