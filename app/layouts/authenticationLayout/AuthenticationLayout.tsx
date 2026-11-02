"use client";

import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Heading,
  Icon,
  Image,
  Badge,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { FaTooth } from "react-icons/fa";
import {
  RiShieldCheckLine,
  RiTimeLine,
  RiHeartPulseLine,
  RiScalesFill,
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const LOGIN_IMAGE =
  "https://salisburydentist.co.uk/wp-content/uploads/2025/04/woman-patient-dentist-1-scaled.jpg";

const FEATURES = [
  { icon: RiShieldCheckLine, label: "HIPAA Compliant" },
  { icon: RiTimeLine, label: "Instant Sync" },
  { icon: RiHeartPulseLine, label: "24/7 Care" },
];

const MOBILE_BG_IMAGES = [
  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1080&auto=format&fit=crop",
  "https://www.aimsindia.com/wp-content/uploads/2026/08/Dental.webp",
];

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % MOBILE_BG_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Flex
      h="100dvh"
      w="100vw"
      bg="gray.950"
      direction={{ base: "column", md: "row" }}
      align="center"
      justify="center"
      p={{ base: 0, md: 6, lg: 10 }}
      overflow="hidden"
      position="relative"
    >
      {/* Ambient Background Glows (Desktop) */}
      <Box display={{ base: "none", md: "block" }} position="absolute" top="-15%" left="-10%" w="650px" h="650px" bg="teal.600" opacity="0.2" filter="blur(160px)" pointerEvents="none" borderRadius="full" />
      <Box display={{ base: "none", md: "block" }} position="absolute" bottom="-15%" right="-10%" w="650px" h="650px" bg="cyan.600" opacity="0.18" filter="blur(160px)" pointerEvents="none" borderRadius="full" />

      {/* Main Container */}
      <Flex
        w="100%"
        maxW="1360px"
        h={{ base: "100dvh", md: "88dvh" }}
        direction={{ base: "column", md: "row" }}
        bg="white"
        rounded={{ base: "none", md: "3xl" }}
        boxShadow="0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)"
        overflow="hidden"
        position="relative"
      >
        {/* ================= DESKTOP VIEW ================= */}
        <Box display={{ base: "none", md: "flex" }} w="100%" h="100%">
          <Box w="54%" h="100%" position="relative" flexShrink={0} bg="gray.950">
            <Box
              position="absolute"
              inset={0}
              bgImage={`url(${LOGIN_IMAGE})`}
              bgSize="cover"
              bgPosition="center"
              transition="transform 8s ease-out"
              _hover={{ transform: "scale(1.04)" }}
            />
            <Box
              position="absolute"
              inset={0}
              bgGradient="linear(to-t, rgba(9, 14, 26, 0.96) 0%, rgba(9, 14, 26, 0.55) 45%, rgba(9, 14, 26, 0.75) 100%)"
            />

            <Box
              position="absolute"
              inset={0}
              p={{ md: 10, lg: 14 }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              zIndex={2}
            >
              <HStack spacing={4} align="center">
                <Flex
                  w="54px"
                  h="54px"
                  rounded="2xl"
                  bg="whiteAlpha.150"
                  backdropFilter="blur(20px)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  align="center"
                  justify="center"
                  boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
                >
                  <FaTooth size={26} color="#38BDF8" />
                </Flex>
                <VStack align="start" spacing={0}>
                  <HStack spacing={2}>
                    <Text color="white" fontWeight="900" fontSize="2xl" letterSpacing="tight">
                      DentalCare
                    </Text>
                    <Badge bg="teal.500" color="white" fontSize="10px" px={2} py={0.5} rounded="full" textTransform="uppercase" fontWeight="800">
                      PRO
                    </Badge>
                  </HStack>
                  <Text color="cyan.300" fontSize="xs" fontWeight="700" letterSpacing="widest" textTransform="uppercase">
                    Clinical Suite & Portal
                  </Text>
                </VStack>
              </HStack>

              <VStack align="start" spacing={6} maxW="520px">
                <HStack spacing={2} bg="whiteAlpha.200" backdropFilter="blur(12px)" px={3} py={1.5} rounded="full" border="1px solid" borderColor="whiteAlpha.300">
                  <Icon as={RiScalesFill} color="teal.300" boxSize={4} />
                  <Text color="teal.100" fontSize="xs" fontWeight="700">
                    Next-Gen Dental Management Platform
                  </Text>
                </HStack>

                <VStack align="start" spacing={3}>
                  <Heading color="white" fontSize={{ md: "4xl", lg: "5xl" }} fontWeight="800" lineHeight="1.1" letterSpacing="tight">
                    Your Smile, <br />
                    <Text as="span" bgGradient="linear(to-r, teal.300, cyan.300, blue.300)" bgClip="text">
                      Our Priority.
                    </Text>
                  </Heading>
                  <Text color="gray.300" fontSize="md" lineHeight="relaxed" fontWeight="400">
                    Effortlessly streamline appointment bookings, clinical records, and patient communications — all in one powerful platform.
                  </Text>
                </VStack>

                <HStack spacing={3} pt={2}>
                  {FEATURES.map(({ icon: IconComponent, label }) => (
                    <HStack key={label} spacing={2} bg="whiteAlpha.150" backdropFilter="blur(16px)" px={4} py={2} rounded="full" border="1px solid" borderColor="whiteAlpha.300" transition="all 0.3s ease" _hover={{ bg: "whiteAlpha.300", transform: "translateY(-2px)" }}>
                      <IconComponent color="#38BDF8" size={16} />
                      <Text color="white" fontSize="xs" fontWeight="700" letterSpacing="wide">
                        {label}
                      </Text>
                    </HStack>
                  ))}
                </HStack>
              </VStack>
            </Box>
          </Box>

          <Flex flex="1" bg="white" align="center" justify="center" px={{ md: 10, lg: 16 }} py={8} overflowY="auto" css={{ "&::-webkit-scrollbar": { display: "none" } }}>
            <Box w="100%" maxW="400px">
              {children}
            </Box>
          </Flex>
        </Box>

        {/* ================= MOBILE VIEW ================= */}
        <Box display={{ base: "block", md: "none" }} w="100%" h="100dvh" position="relative" overflow="hidden" bg="gray.950">
          
          <Box position="absolute" inset={0} zIndex={0}>
            <AnimatePresence initial={false}>
              <motion.div
                key={bgIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              >
                <Image src={MOBILE_BG_IMAGES[bgIndex]} alt="Dental Background" w="100%" h="100%" objectFit="cover" />
              </motion.div>
            </AnimatePresence>
          </Box>

          <Box 
            position="absolute" 
            inset={0} 
            bgGradient="linear(to-b, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.95) 100%)"
            zIndex={1} 
          />

          <Box position="absolute" top="20%" left="-10%" w="300px" h="300px" bg="teal.500" opacity="0.3" filter="blur(80px)" zIndex={1} pointerEvents="none" borderRadius="full" />
          <Box position="absolute" bottom="10%" right="-10%" w="300px" h="300px" bg="purple.500" opacity="0.3" filter="blur(80px)" zIndex={1} pointerEvents="none" borderRadius="full" />

          <Flex position="relative" zIndex={2} direction="column" h="100%" w="100%" align="center" justify="center" px={6} py={8}>
            <Box w="100%" maxW="400px">
              <VStack align="center" mb={8}>
                <Flex 
                  w="64px" h="64px" 
                  rounded="3xl" 
                  bgGradient="linear(to-br, teal.400, cyan.500, blue.600)" 
                  border="1px solid" borderColor="whiteAlpha.400" 
                  align="center" justify="center" mb={3} 
                  boxShadow="0 10px 30px rgba(56, 189, 248, 0.4)"
                >
                  <FaTooth size={32} color="white" />
                </Flex>
                <Text fontWeight="900" fontSize="3xl" color="white" letterSpacing="tight" textShadow="0 2px 10px rgba(0,0,0,0.5)">
                  DentalCare
                </Text>
                <Text fontSize="sm" color="gray.300" fontWeight="500" mt={1}>
                  Welcome back to your portal
                </Text>
              </VStack>

              {children}
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default AuthenticationLayout;