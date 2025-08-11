'use client';

import { Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const DashboardCard = ({ label, value, icon, color, href }: any) => {
  const router = useRouter();

  // Theme-based colors
  const baseBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const accentColor = useColorModeValue(`${color}.600`, `${color}.400`);
  const overlayColor = useColorModeValue(`${color}.100`, `${color}.900`);

  // Card animation
  const cardVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  // Overlay animation
  const overlayVariants = {
    initial: { x: '-100%' },
    hover: { x: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
  };

  return (
    <MotionBox
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      bg={baseBg}
      borderRadius="xl"
      position="relative"
      overflow="hidden"
      boxShadow="0px 6px 20px rgba(0, 0, 0, 0.1)"
      cursor="pointer"
      onClick={() => router.push(href)}
    >
      {/* Sliding Overlay */}
      <MotionBox
        variants={overlayVariants}
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg={overlayColor}
        zIndex={1}
      />

      {/* Content */}
      <Flex
        direction="row"
        align="center"
        justify="space-between"
        h="100%"
        p={5}
        position="relative"
        zIndex={2}
      >
        {/* Left: Icon and Value */}
        <Flex direction="column" justify="center">
          <MotionBox
            whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
            mb={2}
          >
            <Icon as={icon} w={8} h={8} color={accentColor} />
          </MotionBox>
          <Text
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            color={textColor}
            lineHeight="1.2"
          >
            {value.toLocaleString()}
          </Text>
        </Flex>

        {/* Right: Label */}
        <Flex
          direction="column"
          justify="center"
          align="flex-end"
          maxW="50%"
        >
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="medium"
            color={useColorModeValue('gray.600', 'gray.300')}
            textTransform="uppercase"
            letterSpacing="wide"
            textAlign="right"
          >
            {label}
          </Text>
        </Flex>
      </Flex>

      {/* Bottom Accent Line */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        w="100%"
        h="4px"
        bg={accentColor}
        transform="scaleX(0)"
        transformOrigin="left"
        transition="transform 0.4s ease-in-out"
        _groupHover={{ transform: 'scaleX(1)' }}
      />
      <MotionBox
        position="absolute"
        bottom={0}
        left={0}
        w="100%"
        h="4px"
        bg={accentColor}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 0.3, transition: { duration: 0.4, ease: 'easeOut' } }}
        whileHover={{ scaleX: 1, transition: { duration: 0.4, ease: 'easeInOut' } }}
        transformOrigin="left"
        zIndex={2}
      />
    </MotionBox>
  );
};

export default DashboardCard;