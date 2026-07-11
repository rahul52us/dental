import React, { useEffect, useState, useMemo } from 'react';
import { Box, Flex, Text, Heading, Badge, useColorModeValue } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import stores from '../../store/stores';

const marqueeStyle = `marqueeAnimation 20s linear infinite`;

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
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  }, []);

  useEffect(() => {
    stores.advertisementStore.getActiveAdvertisements();
  }, []);

  useEffect(() => {
    if (ads.length > 0) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  if (pathname !== '/dashboard' && pathname !== '/dashboard/advertisements') return null;
  if (ads.length === 0 && pathname !== '/dashboard') return null;

  return (
    <Box mb={8} px={{ base: 4, md: 8 }} pt={{ base: 4, md: 8 }}>
      <style>
        {`
          @keyframes marqueeAnimation {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
      <Flex direction="column" gap={6}>
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'flex-start' }} 
          width="100%"
          gap={{ base: 6, lg: 4 }}
        >
          <Box flex="1" w={{ base: "100%", lg: "auto" }}>
            {pathname === '/dashboard' ? (
              <Box>
                <Text fontSize="xs" fontWeight="900" color={stores.themeStore.themeConfig.colors.custom.light.primary} textTransform="uppercase" letterSpacing="widest" mb={2}>{currentDate}</Text>
                <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" color={useColorModeValue("gray.900", "white")}>
                  {t("dashboard.welcomeBack", { name: user?.name?.split(' ')[0] || "Admin" })}
                </Heading>
                <Text color="gray.500" fontWeight="600" mt={2} fontSize={{ base: "sm", md: "md" }}>{t("dashboard.analyticsOverview")}</Text>
                
                {user?.companyDetails?.subscriptionEndDate && (
                  <Flex align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3} mt={5}>
                    <Badge colorScheme="purple" variant="subtle" borderRadius="md" px={3} py={1} fontSize="xs">
                      PRO PLAN
                    </Badge>
                    <Text fontSize="sm" color="gray.500" fontWeight="600">
                      Valid until <Text as="span" color="gray.700" fontWeight="bold">{new Date(user.companyDetails.subscriptionEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text> 
                      <Text as="span" color={
                        Math.ceil((new Date(user.companyDetails.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) > 7 ? "green.500" : "red.500"
                      } ml={2} display={{ base: "block", md: "inline" }} mt={{ base: 1, md: 0 }}>
                        ({Math.ceil((new Date(user.companyDetails.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining)
                      </Text>
                    </Text>
                  </Flex>
                )}
              </Box>
            ) : (
              <Box>
                <Text fontSize="xs" fontWeight="900" color={stores.themeStore.themeConfig.colors.custom.light.primary} textTransform="uppercase" letterSpacing="widest" mb={2}>
                  Workspace
                </Text>
                <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" color={useColorModeValue("gray.900", "white")} textTransform="capitalize">
                  {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
                </Heading>
                <Text color="gray.500" fontWeight="600" mt={2} fontSize={{ base: "sm", md: "md" }}>
                  Manage and oversee your clinic's {pathname.split('/').pop()?.replace(/-/g, ' ') || 'data'} efficiently.
                </Text>
              </Box>
            )}
          </Box>

          {ads[currentAdIndex]?.image?.url && (
            <Box display="flex" flexDirection="column" alignItems={{ base: "flex-start", lg: "flex-end" }} justifyContent="center" w={{ base: "100%", lg: "auto" }}>
              <Text fontSize="10px" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="widest" mb={1}>Sponsored</Text>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`img-${currentAdIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box 
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="transform 0.3s ease-out"
                    w="100%"
                    maxW={{ base: "100%", lg: "300px" }}
                  >
                    {ads[currentAdIndex].link ? (
                      <a href={ads[currentAdIndex].link} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                        <img src={ads[currentAdIndex].image.url} alt={ads[currentAdIndex].title} style={{ width: "100%", height: "auto", maxHeight: "100px", objectFit: "contain", mixBlendMode: "darken", opacity: 0.9 }} />
                      </a>
                    ) : (
                      <img src={ads[currentAdIndex].image.url} alt={ads[currentAdIndex].title} style={{ width: "100%", height: "auto", maxHeight: "100px", objectFit: "contain", mixBlendMode: "darken", opacity: 0.9 }} />
                    )}
                  </Box>
                </motion.div>
              </AnimatePresence>
            </Box>
          )}
        </Flex>

        {ads.length > 0 && (
          <Box position="relative" borderRadius="2xl" overflow="hidden" boxShadow="xl" bg="white">
            <Box w="100%">
              <Box 
                bgGradient={`linear(to-r, ${stores.themeStore.themeConfig.colors.custom.light.primary}, ${stores.themeStore.themeConfig.colors.custom.light.primary}E6)`} 
                color="white" 
                py={4} 
                overflow="hidden" 
                whiteSpace="nowrap" 
                position="relative" 
                w="100%"
                boxShadow="md"
              >
                <Box
                  display="inline-block"
                  pl="100%"
                  animation={marqueeStyle}
                  fontSize="1.15rem"
                  fontWeight="bold"
                  letterSpacing="wide"
                >
                  {ads.map((ad: any) => `✨ ${ad.title} ✨`).join(" ✦ ")}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Flex>
    </Box>
  );
});

export default AdvertisementBanner;
