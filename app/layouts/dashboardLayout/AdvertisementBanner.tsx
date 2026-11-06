import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Badge,
  useColorModeValue,
  Tooltip,
  HStack,
  Icon,
  VStack,
  Circle,
  Divider,
  Avatar
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiStar, FiZap, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import stores from '../../store/stores';

const marqueeStyle = `marqueeAnimation 25s linear infinite`;
const MotionBox = motion(Box);

const AdvertisementBanner = observer(() => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const ads = (stores.advertisementStore.activeAdvertisements?.data || []).filter((ad: any) => {
    const now = new Date();
    return ad.status !== false && (!ad.validTo || new Date(ad.validTo) >= now);
  });
  const pathname = usePathname();
  const { t } = useTranslation();
  const user = stores.auth.user;

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  }, []);

  useEffect(() => {
    stores.advertisementStore.getActiveAdvertisements();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  if (pathname !== '/dashboard' && pathname !== '/dashboard/advertisements') return null;
  if (ads.length === 0 && pathname !== '/dashboard') return null;

  const daysRemaining = user?.companyDetails?.subscriptionEndDate
    ? Math.ceil((new Date(user.companyDetails.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const primaryColor = stores.themeStore.themeConfig.colors.custom.light.primary;

  // App-like surface colors
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.100", "whiteAlpha.200");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.04)", "0 4px 20px rgba(0,0,0,0.4)");
  const isDark = useColorModeValue(false, true);

  return (
    <Box w="100%">
      <style>
        {`
          @keyframes marqueeAnimation {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>

      {/* ========================================================= */}
      {/* ==================== DESKTOP VIEW ======================= */}
      {/* ========================================================= */}
      <Box display={{ base: "none", md: "block" }} mb={8} px={4} pt={4}>
        <Flex direction="column" gap={6}>
          <Flex justify="space-between" align="center" width="100%" gap={8}>
            {/* Left: Welcome & Pro Plan */}
            <Box flex="1">
              {pathname === '/dashboard' ? (
                <Box>
                  <HStack mb={2} spacing={3}>
                    <Text fontSize="xs" fontWeight="900" color={primaryColor} textTransform="uppercase" letterSpacing="widest">
                      {currentDate}
                    </Text>
                    <Box w={1} h={1} rounded="full" bg="gray.300" />
                    <HStack spacing={1} color="gray.400" fontSize="10px" fontWeight="700">
                      <Icon as={FiCheckCircle} boxSize={3} />
                      <Text>OVERVIEW</Text>
                    </HStack>
                  </HStack>

                  <Heading size="2xl" letterSpacing="tight" color={useColorModeValue("gray.900", "white")} fontWeight="900">
                    {t("dashboard.welcomeBack", { name: user?.name?.split(' ')[0] || "Admin" })}
                  </Heading>
                  <Text color="gray.500" fontWeight="600" mt={2} fontSize="md">
                    {t("dashboard.analyticsOverview")}
                  </Text>

                  {user?.companyDetails?.subscriptionEndDate && (
                    <Tooltip
                      label="Renew your plan from Profile Settings to extend your subscription."
                      placement="bottom-start" hasArrow bg="gray.800" color="white" px={3} py={2} borderRadius="lg" fontSize="xs" fontWeight="600"
                    >
                      <Flex
                        mt={5} align="center" bg={cardBg} borderWidth="1px" borderColor={cardBorder} rounded="xl" px={5} py={2.5} w="fit-content" cursor="help" boxShadow="sm" transition="all 0.2s" _hover={{ boxShadow: "md", borderColor: "purple.200" }} gap={4}
                      >
                        <HStack spacing={2}>
                          <Icon as={FiStar} color="purple.500" boxSize={4} />
                          <Text fontSize="sm" fontWeight="900" color={isDark ? "white" : "gray.800"}>PRO PLAN</Text>
                        </HStack>
                        <Divider orientation="vertical" height="16px" borderColor="gray.300" />
                        <Text fontSize="xs" color="gray.500" fontWeight="600">
                          Valid until <Text as="span" fontWeight="800" color={isDark ? "gray.200" : "gray.700"}>{new Date(user.companyDetails.subscriptionEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                        </Text>
                        <Badge colorScheme={daysRemaining > 7 ? "green" : "red"} variant="subtle" rounded="md" px={2.5} py={1} fontSize="10px" fontWeight="800">
                          {daysRemaining} DAYS LEFT
                        </Badge>
                      </Flex>
                    </Tooltip>
                  )}
                </Box>
              ) : (
                <Box>
                  <Text fontSize="xs" fontWeight="900" color={primaryColor} textTransform="uppercase" letterSpacing="widest" mb={2}>
                    Workspace
                  </Text>
                  <Heading size="2xl" letterSpacing="tight" color={useColorModeValue("gray.900", "white")} textTransform="capitalize" fontWeight="900">
                    {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
                  </Heading>
                  <Text color="gray.500" fontWeight="600" mt={2} fontSize="md">
                    Manage and oversee your clinic's {pathname.split('/').pop()?.replace(/-/g, ' ') || 'data'} efficiently.
                  </Text>
                </Box>
              )}
            </Box>

            {/* Right: Sponsored Ad */}
            {ads[currentAdIndex]?.image?.url && (
              <Box display="flex" flexDirection="column" alignItems="flex-end" justifyContent="center">
                <Text fontSize="10px" color="gray.400" fontWeight="800" textTransform="uppercase" letterSpacing="widest" mb={2} mr={1}>
                  Sponsored
                </Text>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`desktop-ad-${currentAdIndex}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Box
                      bg={cardBg} rounded="2xl" borderWidth="1px" borderColor={cardBorder} boxShadow={cardShadow} p={2} pr={4} _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }} transition="all 0.3s ease-out"
                      cursor={ads[currentAdIndex].link ? "pointer" : "default"}
                      onClick={() => {
                        if (ads[currentAdIndex].link) window.open(ads[currentAdIndex].link, "_blank");
                      }}
                    >
                      <Flex align="center" gap={4}>
                        <Box w="48px" h="48px" rounded="xl" overflow="hidden" flexShrink={0} borderWidth="1px" borderColor={cardBorder}>
                          <img src={ads[currentAdIndex].image.url} alt={ads[currentAdIndex].title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </Box>
                        <Box minW="120px">
                          <Text fontSize="sm" fontWeight="800" color={useColorModeValue("gray.800", "white")} noOfLines={1}>
                            {ads[currentAdIndex].title || "Special Offer"}
                          </Text>
                          <Text fontSize="xs" color="gray.500" fontWeight="600">Tap to view</Text>
                        </Box>
                        <Icon as={FiChevronRight} boxSize={5} color="gray.300" />
                      </Flex>
                    </Box>
                  </motion.div>
                </AnimatePresence>
              </Box>
            )}
          </Flex>

          {/* Desktop Bottom Ticker */}
          {ads.length > 0 && (
            <Box
              position="relative" borderRadius="2xl" overflow="hidden" bgGradient={`linear(to-r, ${primaryColor}, ${primaryColor}E6)`} boxShadow="md" py={3}
            >
              <Flex align="center" px={4}>
                <Circle size="24px" bg="whiteAlpha.300" color="white" mr={3} flexShrink={0}>
                  <Icon as={FiZap} boxSize={3} />
                </Circle>
                <Box overflow="hidden" whiteSpace="nowrap" w="100%" position="relative">
                  <Box display="inline-block" pl="100%" animation={marqueeStyle} fontSize="sm" fontWeight="800" color="white" letterSpacing="wide">
                    {ads.map((ad: any) => `✨ ${ad.title}`).join("   •   ")}
                  </Box>
                </Box>
              </Flex>
            </Box>
          )}
        </Flex>
      </Box>

      {/* ========================================================= */}
      {/* ==================== MOBILE APK VIEW ==================== */}
      {/* ========================================================= */}
      <Box display={{ base: "block", md: "none" }} mb={3} px={4} pt={3}>
        <VStack align="stretch" spacing={3}>

          {/* Unified Executive Hero Card (Welcome + Avatar + Pro Plan in One Card) */}
          {pathname === '/dashboard' ? (
            <MotionBox
              p={4}
              borderRadius="28px"
              bgGradient="linear(135deg, #0284C7 0%, #0D9488 50%, #1E40AF 100%)"
              color="white"
              boxShadow="0 12px 28px -6px rgba(14, 165, 233, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
              position="relative"
              overflow="hidden"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Ambient Glowing Glass Elements */}
              <Circle position="absolute" size="140px" bg="whiteAlpha.150" right="-25px" bottom="-40px" filter="blur(16px)" />
              <Circle position="absolute" size="90px" bg="cyan.300" opacity="0.2" left="-25px" top="-25px" filter="blur(20px)" />

              <Box position="relative" zIndex={1}>
                {/* Top Info Strip */}
                <Flex justify="space-between" align="center" mb={2.5}>
                  <Badge
                    bg="whiteAlpha.250"
                    color="white"
                    rounded="full"
                    px={2.5}
                    py={0.5}
                    fontSize="9px"
                    fontWeight="800"
                    backdropFilter="blur(8px)"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                  >
                    {currentDate}
                  </Badge>

                  {user?.companyDetails?.subscriptionEndDate ? (
                    <HStack
                      bg="whiteAlpha.250"
                      backdropFilter="blur(8px)"
                      px={2.5}
                      py={0.5}
                      rounded="full"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      spacing={1}
                    >
                      <Icon as={FiStar} color="yellow.300" boxSize={3} />
                      <Text fontSize="9px" fontWeight="800" color="white" letterSpacing="0.3px">
                        PRO • {daysRemaining}D LEFT
                      </Text>
                    </HStack>
                  ) : (
                    <HStack spacing={1} color="whiteAlpha.900" fontSize="9px" fontWeight="700">
                      <Icon as={FiCheckCircle} boxSize={3} />
                      <Text>PRACTICE ACTIVE</Text>
                    </HStack>
                  )}
                </Flex>

                {/* Friendly Greeting with Avatar */}
                <HStack spacing={3} align="center">
                  <Avatar
                    size="md"
                    src={user?.pic?.url}
                    name={user?.name || "Doctor"}
                    borderRadius="2xl"
                    border="2px solid white"
                    boxShadow="0 4px 12px rgba(0,0,0,0.2)"
                    flexShrink={0}
                  />
                  <Box flex="1" minW={0}>
                    <Text fontSize="10px" fontWeight="800" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.5px">
                      CLINIC DASHBOARD
                    </Text>
                    <Heading
                      fontSize={{ base: "17px", sm: "19px" }}
                      fontWeight="900"
                      letterSpacing="-0.3px"
                      lineHeight="1.2"
                      color="white"
                      noOfLines={1}
                    >
                      Welcome, {user?.name?.split(' ')[0] || "Doctor"} 👋
                    </Heading>
                    <Text color="whiteAlpha.900" fontSize="11px" fontWeight="500" mt={0.5} noOfLines={1}>
                      {t("dashboard.analyticsOverview")}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            </MotionBox>
          ) : (
            <Box pt={1}>
              <Text fontSize="10px" fontWeight="900" color={primaryColor} textTransform="uppercase" letterSpacing="widest" mb={0.5}>
                Workspace
              </Text>
              <Heading size="md" letterSpacing="tight" color={isDark ? "white" : "gray.800"} textTransform="capitalize" fontWeight="900">
                {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </Heading>
              <Text color="gray.500" fontWeight="600" fontSize="xs">
                Manage your clinic's {pathname.split('/').pop()?.replace(/-/g, ' ') || 'data'}.
              </Text>
            </Box>
          )}

          {/* Compact Sponsored Ad Pill (If Available) */}
          {ads[currentAdIndex]?.image?.url && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-ad-${currentAdIndex}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <Box
                  bg={cardBg}
                  rounded="2xl"
                  borderWidth="1px"
                  borderColor={cardBorder}
                  boxShadow="sm"
                  p={2}
                  pr={3}
                  cursor={ads[currentAdIndex].link ? "pointer" : "default"}
                  onClick={() => {
                    if (ads[currentAdIndex].link) window.open(ads[currentAdIndex].link, "_blank");
                  }}
                >
                  <Flex align="center" gap={3}>
                    <Box w="36px" h="36px" rounded="xl" overflow="hidden" flexShrink={0} borderWidth="1px" borderColor={cardBorder}>
                      <img src={ads[currentAdIndex].image.url} alt={ads[currentAdIndex].title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                    <Box flex="1" minW={0}>
                      <Text fontSize="8px" color="blue.500" fontWeight="800" textTransform="uppercase" letterSpacing="widest">
                        Sponsored
                      </Text>
                      <Text fontSize="xs" fontWeight="800" color={isDark ? "white" : "gray.800"} noOfLines={1}>
                        {ads[currentAdIndex].title || "Special Offer"}
                      </Text>
                    </Box>
                    <Icon as={FiChevronRight} boxSize={4} color="gray.400" />
                  </Flex>
                </Box>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Compact Marquee Pill */}
          {ads.length > 0 && (
            <Box
              position="relative"
              borderRadius="full"
              overflow="hidden"
              bg={cardBg}
              borderWidth="1px"
              borderColor={cardBorder}
              boxShadow="0 2px 8px rgba(0,0,0,0.03)"
              px={2.5}
              py={1}
            >
              <Flex align="center">
                <Circle size="18px" bg="blue.500" color="white" mr={2} flexShrink={0}>
                  <Icon as={FiZap} boxSize={2.5} />
                </Circle>
                <Box overflow="hidden" whiteSpace="nowrap" w="100%" position="relative">
                  <Box
                    display="inline-block"
                    pl="100%"
                    animation={marqueeStyle}
                    fontSize="10px"
                    fontWeight="800"
                    color={isDark ? "gray.300" : "gray.600"}
                    letterSpacing="wide"
                  >
                    {ads.map((ad: any) => `✨ ${ad.title}`).join("   •   ")}
                  </Box>
                </Box>
              </Flex>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
});

export default AdvertisementBanner;
