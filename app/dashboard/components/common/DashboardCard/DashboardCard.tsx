'use client';

import { Badge, Box, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const DashboardCard = ({ label, value, icon, color, href }: any) => {
  const router = useRouter();

  // Vibrant HSL-based palette for "Luminous" effect
  const colorMap: Record<string, string> = {
    blue: "210, 100%, 50%",
    green: "145, 80%, 45%",
    purple: "270, 70%, 60%",
    orange: "25, 95%, 55%",
  };

  const hsl = colorMap[color] || "210, 100%, 50%";
  const glowColor = `hsla(${hsl}, 0.15)`;
  const accentColor = `hsl(${hsl})`;
  const baseBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');

  // Trend mock (dynamic in real app)
  const isPositive = true;
  const trend = "+12.5%";

  return (
    <MotionBox
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      bg={useColorModeValue('white', 'rgba(26, 32, 44, 0.6)')}
      p={6}
      borderRadius="3xl"
      position="relative"
      overflow="hidden"
      cursor="pointer"
      onClick={() => router.push(href)}
      boxShadow={useColorModeValue(
        `0 20px 40px -10px hsla(${hsl}, 0.1)`,
        `0 20px 40px -10px hsla(${hsl}, 0.3)`
      )}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.100', 'whiteAlpha.200')}
      backdropFilter="blur(20px)"
      transition={{ duration: 0.3 }}
    >
      {/* Signature Glow */}
      <Box
        position="absolute"
        top="-30px"
        right="-30px"
        w="120px"
        h="120px"
        bg={accentColor}
        borderRadius="full"
        filter="blur(50px)"
        opacity={0.2}
        zIndex={0}
      />

      <Flex direction="column" position="relative" zIndex={1}>
        <Flex justify="space-between" align="start" mb={6}>
          <Box
            p={3.5}
            borderRadius="2xl"
            bg={glowColor}
            color={accentColor}
            boxShadow={`inset 0 0 10px hsla(${hsl}, 0.2)`}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={icon} boxSize={7} />
          </Box>

          <Badge
            variant="subtle"
            colorScheme={isPositive ? "green" : "red"}
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            fontWeight="900"
            display="flex"
            alignItems="center"
            gap={1}
          >
            {trend}
          </Badge>
        </Flex>

        <Box mt="auto">
          <Text
            fontSize="4xl"
            fontWeight="900"
            color={textColor}
            letterSpacing="tight"
            lineHeight="1.1"
          >
            {value.toLocaleString()}
          </Text>
          <Text
            fontSize="xs"
            fontWeight="800"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="2px"
            mt={3}
            opacity={0.8}
          >
            {label}
          </Text>
        </Box>
      </Flex>

      {/* Decorative Watermark Icon */}
      <Icon
        as={icon}
        position="absolute"
        right="-10px"
        bottom="-15px"
        boxSize="110px"
        color={accentColor}
        opacity={0.04}
        transform="rotate(-12deg)"
        zIndex={0}
      />
    </MotionBox>
  );
};

export default DashboardCard;