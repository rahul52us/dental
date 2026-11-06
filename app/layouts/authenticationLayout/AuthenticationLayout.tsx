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
  RiSparklingFill,
  RiLockLine,
} from "react-icons/ri";

const SHOWCASE_SLIDES = [
  {
    image: "https://img.freepik.com/free-vector/dentist-examining-boy-dental-chair-doctor-tooth-visit-flat-vector-illustration-stomatology-dentistry_74855-13053.jpg?semt=ais_hybrid&w=740&q=80",
    backup: "https://img.magnific.com/free-vector/dentist-examining-boy-dental-chair-doctor-tooth-visit-flat-vector-illustration-stomatology-dentistry_74855-13053.jpg?semt=ais_hybrid&w=740&q=80",
    fallback: "/dental-login-image.jpeg",
    tag: "GENTLE PATIENT CARE",
    headline: "Friendly Dental Visits,",
    headlineAccent: "Stress-Free.",
    subtitle: "Deliver comforting pediatric and family dental care with automated recall, smart charting, and happy smiling patients.",
    statNumber: "100%",
    statLabel: "Comfort & Precision",
  },
  {
    image: "https://img.freepik.com/free-vector/flat-dental-care-concept_23-2148984320.jpg?semt=ais_hybrid&w=740&q=80",
    backup: "https://img.magnific.com/free-vector/flat-dental-care-concept_23-2148984320.jpg?semt=ais_hybrid&w=740&q=80",
    fallback: "/dental-login-image.jpeg",
    tag: "COMPLETE CLINICAL SUITE",
    headline: "Every Smile Deserves",
    headlineAccent: "Exceptional Care.",
    subtitle: "Sitting-wise treatment plans, interactive odontograms, multi-chair scheduling, and seamless cloud synchronization.",
    statNumber: "18,400+",
    statLabel: "Happy Smiles Treated",
  },
  {
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=85",
    backup: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&q=85",
    fallback: "/dental-login-image.jpeg",
    tag: "SMART OPERATORY",
    headline: "Intelligent Clinical Care,",
    headlineAccent: "Simplified.",
    subtitle: "From digital radiography and tooth-level histories to sitting-wise ledger tracking — stay synced across every clinic chair.",
    statNumber: "99.8%",
    statLabel: "Clinical Accuracy",
  },
];

const FEATURES = [
  { icon: RiShieldCheckLine, label: "HIPAA Compliant" },
  { icon: RiTimeLine, label: "Instant Sync" },
  { icon: RiHeartPulseLine, label: "24/7 Practice Care" },
];

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides smoothly every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = SHOWCASE_SLIDES[currentSlide];

  return (
    <Flex
      h="100dvh"
      maxH="100dvh"
      w="100vw"
      bg={{ base: "#F8FAFC", md: "gray.950" }}
      direction={{ base: "column", md: "row" }}
      align="center"
      justify="center"
      p={{ base: 0, md: 6, lg: 10 }}
      overflow="hidden"
      position="relative"
    >
      {/* Ambient Background Glows (Desktop) */}
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        top="-15%"
        left="-10%"
        w="650px"
        h="650px"
        bg="teal.600"
        opacity="0.2"
        filter="blur(160px)"
        pointerEvents="none"
        borderRadius="full"
      />
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        bottom="-15%"
        right="-10%"
        w="650px"
        h="650px"
        bg="cyan.600"
        opacity="0.18"
        filter="blur(160px)"
        pointerEvents="none"
        borderRadius="full"
      />

      {/* Main Container */}
      <Flex
        w="100%"
        maxW="1360px"
        h={{ base: "100dvh", md: "88dvh" }}
        maxH="100dvh"
        direction={{ base: "column", md: "row" }}
        bg="white"
        rounded={{ base: "none", md: "3xl" }}
        boxShadow={{
          base: "none",
          md: "0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        }}
        overflow="hidden"
        position="relative"
      >
        {/* ================= LEFT COLUMN: DYNAMIC DESKTOP HERO SHOWCASE ================= */}
        <Box
          display={{ base: "none", md: "flex" }}
          w="54%"
          h="100%"
          position="relative"
          flexShrink={0}
          bg="gray.950"
          overflow="hidden"
        >
          {/* Crossfading Background Images */}
          {SHOWCASE_SLIDES.map((s, index) => (
            <Box
              key={s.tag}
              position="absolute"
              inset={0}
              opacity={currentSlide === index ? 1 : 0}
              transition="opacity 1.2s ease-in-out, transform 8s ease-out"
              transform={currentSlide === index ? "scale(1.05)" : "scale(1)"}
              overflow="hidden"
            >
              <Image
                src={s.image}
                alt={s.headline}
                w="100%"
                h="100%"
                objectFit="cover"
                objectPosition="center"
                referrerPolicy="no-referrer"
                fallbackSrc={s.fallback}
                onError={(e: any) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith(s.fallback)) {
                    return;
                  }
                  if (s.backup && target.src.includes(s.image.split("?")[0])) {
                    target.src = s.backup;
                  } else {
                    target.src = s.fallback;
                  }
                }}
              />
            </Box>
          ))}

          {/* Deep Cinematic Vignette Overlay */}
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(to-t, rgba(9, 14, 26, 0.94) 0%, rgba(9, 14, 26, 0.48) 45%, rgba(9, 14, 26, 0.16) 100%)"
          />

          {/* Overlay Content */}
          <Box
            position="absolute"
            inset={0}
            p={{ md: 10, lg: 14 }}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            zIndex={2}
          >
            {/* Top Brand Bar */}
            <Flex justify="space-between" align="center" w="100%">
              <HStack spacing={4} align="center">
                <Flex
                  w="54px"
                  h="54px"
                  rounded="2xl"
                  bgGradient="linear(135deg, #0EA5E9 0%, #0D9488 100%)"
                  border="1.5px solid rgba(255, 255, 255, 0.3)"
                  align="center"
                  justify="center"
                  boxShadow="0 10px 25px rgba(14, 165, 233, 0.4)"
                >
                  <FaTooth size={26} color="white" />
                </Flex>
                <VStack align="start" spacing={0}>
                  <HStack spacing={2}>
                    <Text
                      color="white"
                      fontWeight="900"
                      fontSize="2xl"
                      letterSpacing="tight"
                    >
                      DentalCare
                    </Text>
                    <Badge
                      bgGradient="linear(to-r, cyan.400, teal.400)"
                      color="white"
                      fontSize="10px"
                      px={2}
                      py={0.5}
                      rounded="full"
                      textTransform="uppercase"
                      fontWeight="800"
                      boxShadow="0 2px 6px rgba(0,0,0,0.2)"
                    >
                      PRO SUITE
                    </Badge>
                  </HStack>
                  <Text
                    color="cyan.300"
                    fontSize="xs"
                    fontWeight="700"
                    letterSpacing="widest"
                    textTransform="uppercase"
                  >
                    Clinical Suite & Portal
                  </Text>
                </VStack>
              </HStack>

              {/* Live Status Pill */}
              <HStack
                bg="rgba(255, 255, 255, 0.12)"
                backdropFilter="blur(16px)"
                px={3.5}
                py={1.5}
                rounded="full"
                border="1px solid rgba(255, 255, 255, 0.2)"
              >
                <Box w="7px" h="7px" rounded="full" bg="#10B981" boxShadow="0 0 10px #10B981" />
                <Text color="white" fontSize="xs" fontWeight="800" letterSpacing="0.4px">
                  PRACTICE LIVE
                </Text>
              </HStack>
            </Flex>

            {/* Middle Editorial Story & Stat Box */}
            <VStack align="start" spacing={6} maxW="520px">
              <HStack
                spacing={2}
                bg="whiteAlpha.200"
                backdropFilter="blur(16px)"
                px={3.5}
                py={1.5}
                rounded="full"
                border="1px solid"
                borderColor="whiteAlpha.300"
              >
                <Icon as={RiSparklingFill} color="cyan.300" boxSize={3.5} />
                <Text color="cyan.100" fontSize="xs" fontWeight="800" letterSpacing="0.4px">
                  {slide.tag}
                </Text>
              </HStack>

              <VStack align="start" spacing={3}>
                <Heading
                  color="white"
                  fontSize={{ md: "4xl", lg: "5xl" }}
                  fontWeight="900"
                  lineHeight="1.1"
                  letterSpacing="tight"
                >
                  {slide.headline} <br />
                  <Text
                    as="span"
                    bgGradient="linear(to-r, teal.300, cyan.300, #818CF8)"
                    bgClip="text"
                  >
                    {slide.headlineAccent}
                  </Text>
                </Heading>
                <Text
                  color="gray.300"
                  fontSize="md"
                  lineHeight="relaxed"
                  fontWeight="400"
                >
                  {slide.subtitle}
                </Text>
              </VStack>

              {/* Floating Stat Callout Card */}
              <HStack
                spacing={4}
                p={4}
                bg="rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(20px)"
                rounded="2xl"
                border="1px solid rgba(255, 255, 255, 0.18)"
                boxShadow="0 15px 35px rgba(0,0,0,0.2)"
              >
                <Text
                  fontSize="32px"
                  fontWeight="900"
                  bgGradient="linear(to-r, cyan.200, teal.200)"
                  bgClip="text"
                  lineHeight="1"
                >
                  {slide.statNumber}
                </Text>
                <VStack align="start" spacing={0}>
                  <Text color="white" fontSize="sm" fontWeight="800">
                    {slide.statLabel}
                  </Text>
                  <Text color="gray.300" fontSize="xs">
                    Across connected operatories & staff
                  </Text>
                </VStack>
              </HStack>

              {/* Slide Selector Indicators */}
              <HStack spacing={2} pt={2}>
                {SHOWCASE_SLIDES.map((_, i) => (
                  <Box
                    key={i}
                    w={currentSlide === i ? "32px" : "8px"}
                    h="6px"
                    rounded="full"
                    bg={currentSlide === i ? "cyan.400" : "whiteAlpha.400"}
                    transition="all 0.3s ease"
                    cursor="pointer"
                    onClick={() => setCurrentSlide(i)}
                    _hover={{ bg: "cyan.300" }}
                  />
                ))}
              </HStack>
            </VStack>

            {/* Bottom Features Pill Row */}
            <HStack spacing={3} pt={2}>
              {FEATURES.map(({ icon: IconComponent, label }) => (
                <HStack
                  key={label}
                  spacing={2}
                  bg="whiteAlpha.150"
                  backdropFilter="blur(16px)"
                  px={4}
                  py={2}
                  rounded="full"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  transition="all 0.3s ease"
                  _hover={{
                    bg: "whiteAlpha.300",
                    transform: "translateY(-2px)",
                  }}
                >
                  <IconComponent color="#38BDF8" size={16} />
                  <Text
                    color="white"
                    fontSize="xs"
                    fontWeight="700"
                    letterSpacing="wide"
                  >
                    {label}
                  </Text>
                </HStack>
              ))}
            </HStack>
          </Box>
        </Box>

        {/* ================= RIGHT / MAIN COLUMN (PREMIUM MOBILE & DESKTOP) ================= */}
        <Flex
          flex="1"
          w="100%"
          h="100%"
          maxH="100dvh"
          position="relative"
          bg="white"
          direction="column"
          align="center"
          justify={{ base: "space-between", md: "center" }}
          overflow="hidden"
          px={{ base: 0, md: 8, lg: 12 }}
          py={{ base: 0, md: 8 }}
        >
          {/* ================= MOBILE HERO VISUAL BANNER (AWESOME & EXPANDED) ================= */}
          <Box
            display={{ base: "block", md: "none" }}
            w="100%"
            h={{ base: "195px", sm: "220px" }}
            position="relative"
            flexShrink={0}
            overflow="hidden"
            borderBottomRadius="32px"
            boxShadow="0 14px 30px -6px rgba(15, 23, 42, 0.18)"
          >
            {/* Dynamic Showcase Slide Images (Mobile Crossfade) */}
            {SHOWCASE_SLIDES.map((s, index) => (
              <Box
                key={s.tag}
                position="absolute"
                inset={0}
                opacity={currentSlide === index ? 1 : 0}
                transition="opacity 1.2s ease-in-out, transform 6s ease-out"
                transform={currentSlide === index ? "scale(1.04)" : "scale(1)"}
                overflow="hidden"
              >
                <Image
                  src={s.image}
                  alt={s.headline}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  objectPosition="center 35%"
                  referrerPolicy="no-referrer"
                  fallbackSrc={s.fallback}
                  onError={(e: any) => {
                    const target = e.currentTarget;
                    if (target.src.endsWith(s.fallback)) {
                      return;
                    }
                    if (s.backup && target.src.includes(s.image.split("?")[0])) {
                      target.src = s.backup;
                    } else {
                      target.src = s.fallback;
                    }
                  }}
                />
              </Box>
            ))}

            {/* Clear, Radiant Cinematic Gradient Mask */}
            <Box
              position="absolute"
              inset={0}
              bgGradient="linear(to-b, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.05) 40%, rgba(15, 23, 42, 0.68) 100%)"
            />

            {/* Top Bar: Brand Pill & Live Status */}
            <Flex
              position="absolute"
              top={2.5}
              left={3.5}
              right={3.5}
              justify="space-between"
              align="center"
              zIndex={3}
            >
              <HStack
                spacing={1.2}
                bg="rgba(255, 255, 255, 0.2)"
                backdropFilter="blur(14px)"
                px={2.5}
                py={0.8}
                rounded="full"
                border="1px solid rgba(255, 255, 255, 0.3)"
                boxShadow="0 2px 8px rgba(0,0,0,0.2)"
              >
                <FaTooth size={11} color="#38BDF8" />
                <Text fontSize="10px" fontWeight="900" color="white" letterSpacing="0.5px">
                  DENTALCARE
                </Text>
                <Badge
                  bgGradient="linear(to-r, cyan.400, teal.400)"
                  color="white"
                  fontSize="7.5px"
                  px={1.2}
                  py={0.2}
                  rounded="full"
                  fontWeight="900"
                >
                  PRO
                </Badge>
              </HStack>

              <HStack
                bg="rgba(15, 23, 42, 0.72)"
                backdropFilter="blur(14px)"
                px={2.5}
                py={0.8}
                rounded="full"
                border="1px solid rgba(255, 255, 255, 0.2)"
                boxShadow="0 2px 8px rgba(0,0,0,0.25)"
              >
                <Box w="5px" h="5px" rounded="full" bg="#10B981" boxShadow="0 0 6px #10B981" />
                <Text fontSize="9px" fontWeight="800" color="white" letterSpacing="0.4px">
                  PRACTICE LIVE
                </Text>
              </HStack>
            </Flex>

            {/* Bottom Slide Info Tag */}
            <Box
              position="absolute"
              bottom={2}
              left={3.5}
              right={3.5}
              zIndex={3}
            >
              <HStack justify="space-between" align="center">
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="cyan.200"
                  letterSpacing="0.3px"
                  noOfLines={1}
                >
                  ✨ {slide.headline} {slide.headlineAccent}
                </Text>

                {/* Micro Slide Dots */}
                <HStack spacing={1}>
                  {SHOWCASE_SLIDES.map((_, i) => (
                    <Box
                      key={i}
                      w={currentSlide === i ? "12px" : "4px"}
                      h="4px"
                      rounded="full"
                      bg={currentSlide === i ? "white" : "whiteAlpha.500"}
                      transition="all 0.3s ease"
                    />
                  ))}
                </HStack>
              </HStack>
            </Box>
          </Box>

          {/* Glowing 3D Tooth Squircle Badge (Overlapping Mobile Banner) */}
          <Flex
            display={{ base: "flex", md: "none" }}
            w="48px"
            h="48px"
            rounded="20px"
            bgGradient="linear(135deg, #0EA5E9 0%, #0D9488 50%, #6366F1 100%)"
            align="center"
            justify="center"
            boxShadow="0 10px 25px -2px rgba(14, 165, 233, 0.55), inset 0 1px 1px rgba(255,255,255,0.7)"
            border="3px solid white"
            mt="-24px"
            mb={0.5}
            zIndex={4}
            flexShrink={0}
          >
            <FaTooth size={22} color="white" />
          </Flex>

          {/* Form Container (Open, Unboxed, Zero-Scroll, Responsive) */}
          <Box
            w="100%"
            maxW={{ base: "380px", md: "430px" }}
            px={{ base: 4, sm: 6, md: 0 }}
            py={{ base: 0, md: 0 }}
            flex="1"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            zIndex={2}
          >
            {children}
          </Box>

          {/* Safe Bottom Footer */}
          <HStack
            spacing={1.2}
            justify="center"
            pb="calc(6px + env(safe-area-inset-bottom, 0px))"
            pt={1}
            flexShrink={0}
            opacity={0.8}
          >
            <Icon as={RiLockLine} color="teal.600" boxSize={3} />
            <Text fontSize="9.5px" color="gray.500" fontWeight="600" letterSpacing="0.2px">
              256-BIT SSL ENCRYPTION • HIPAA & NABH COMPLIANT
            </Text>
          </HStack>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default AuthenticationLayout;
