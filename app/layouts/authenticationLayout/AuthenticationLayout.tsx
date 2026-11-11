"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaTooth } from "react-icons/fa";
import {
  RiHeartPulseLine,
  RiShieldCheckLine,
  RiSparklingFill,
  RiTimeLine,
} from "react-icons/ri";

const SHOWCASE_SLIDES = [
  {
    image:
      "https://img.freepik.com/free-vector/dentist-examining-boy-dental-chair-doctor-tooth-visit-flat-vector-illustration-stomatology-dentistry_74855-13053.jpg?semt=ais_hybrid&w=1200&q=85",
    tag: "CARE THAT FEELS DIFFERENT",
    headline: "A brighter practice",
    accent: "starts here.",
    description:
      "The thoughtful tools behind calmer visits, healthier smiles, and a practice that runs beautifully.",
  },
  {
    image:
      "https://img.freepik.com/free-vector/flat-dental-care-concept_23-2148984320.jpg?semt=ais_hybrid&w=1200&q=85",
    tag: "YOUR PRACTICE, IN SYNC",
    headline: "Every detail,",
    accent: "beautifully connected.",
    description:
      "Bring your team, patients, and day-to-day operations together in one clear, dependable workspace.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=85",
    tag: "MADE FOR MODERN DENTISTRY",
    headline: "More time for",
    accent: "what matters.",
    description:
      "Spend less time coordinating care and more time making every patient feel at home.",
  },
];

const TRUST_POINTS = [
  { icon: RiShieldCheckLine, label: "Privacy first" },
  { icon: RiTimeLine, label: "Always in sync" },
  { icon: RiHeartPulseLine, label: "Care focused" },
];

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = SHOWCASE_SLIDES[currentSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % SHOWCASE_SLIDES.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <Flex
      h="100dvh"
      minH={0}
      maxH="100dvh"
      w="100%"
      align="center"
      justify="center"
      bg={{ base: "#F4F8F8", md: "#0D2428" }}
      p={{ base: 0, md: 6, lg: 10 }}
      overflow="hidden"
      position="relative"
    >
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        w="500px"
        h="500px"
        rounded="full"
        bg="#1A7470"
        opacity={0.22}
        filter="blur(130px)"
        top="-230px"
        left="-140px"
        pointerEvents="none"
      />
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        w="520px"
        h="520px"
        rounded="full"
        bg="#2779A0"
        opacity={0.2}
        filter="blur(140px)"
        bottom="-280px"
        right="-160px"
        pointerEvents="none"
      />

      <Flex
        w="100%"
        maxW="1240px"
        h={{ base: "100%", md: "min(790px, calc(100dvh - 48px))" }}
        minH={0}
        maxH="100%"
        direction={{ base: "column", md: "row" }}
        bg="white"
        rounded={{ base: 0, md: "30px" }}
        overflow="hidden"
        position="relative"
        boxShadow={{
          base: "none",
          md: "0 32px 90px rgba(0, 0, 0, 0.28), 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <Box
          w={{ base: "100%", md: "54%" }}
          h={{
            base: "clamp(128px, 25dvh, 180px)",
            sm: "clamp(145px, 28dvh, 200px)",
            md: "auto",
          }}
          minH={{ md: "100%" }}
          flexShrink={0}
          position="relative"
          overflow="hidden"
          bg="#153C40"
        >
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(145deg, #173F43 0%, #227B79 52%, #8CCBC2 100%)"
          />
          <Box
            position="absolute"
            w={{ base: "280px", md: "480px" }}
            h={{ base: "280px", md: "480px" }}
            rounded="full"
            border="1px solid"
            borderColor="whiteAlpha.300"
            top={{ base: "60px", md: "120px" }}
            right={{ base: "-110px", md: "-120px" }}
          />
          <Box
            position="absolute"
            w={{ base: "190px", md: "320px" }}
            h={{ base: "190px", md: "320px" }}
            rounded="full"
            border="1px solid"
            borderColor="whiteAlpha.300"
            top={{ base: "104px", md: "200px" }}
            right={{ base: "-64px", md: "-40px" }}
          />
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            color="whiteAlpha.400"
          >
            <FaTooth size={220} />
          </Flex>

          {SHOWCASE_SLIDES.map((item, index) => (
            <Box
              key={item.tag}
              position="absolute"
              inset={0}
              opacity={currentSlide === index ? 1 : 0}
              transition="opacity 700ms ease"
              pointerEvents="none"
            >
              <Image
                src={item.image}
                alt=""
                aria-hidden="true"
                w="100%"
                h="100%"
                objectFit="cover"
                objectPosition="center"
                opacity={0.77}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </Box>
          ))}

          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(to-b, rgba(10,31,34,0.34) 0%, rgba(10,31,34,0.08) 35%, rgba(8,28,31,0.88) 100%)"
          />

          <Flex
            position="absolute"
            inset={0}
            direction="column"
            justify="space-between"
            p={{ base: 4, sm: 5, md: 10, lg: 12 }}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={2.5}>
                <Flex
                  w={{ base: "36px", md: "44px" }}
                  h={{ base: "36px", md: "44px" }}
                  rounded="14px"
                  align="center"
                  justify="center"
                  color="white"
                  bg="rgba(255,255,255,0.16)"
                  border="1px solid rgba(255,255,255,0.26)"
                  backdropFilter="blur(12px)"
                >
                  <FaTooth size={20} />
                </Flex>
                <VStack spacing={0} align="start">
                  <HStack spacing={1.5}>
                    <Text
                      color="white"
                      fontSize={{ base: "sm", md: "md" }}
                      fontWeight="800"
                      letterSpacing="-0.3px"
                    >
                      DentalCare
                    </Text>
                    <Badge
                      bg="#C8F3E9"
                      color="#155E57"
                      rounded="full"
                      px={1.5}
                      fontSize="9px"
                      fontWeight="900"
                      letterSpacing="0.5px"
                    >
                      PRO
                    </Badge>
                  </HStack>
                  <Text
                    color="whiteAlpha.800"
                    fontSize="9px"
                    fontWeight="700"
                    letterSpacing="1.25px"
                    textTransform="uppercase"
                  >
                    Practice, in harmony
                  </Text>
                </VStack>
              </HStack>

              <HStack
                spacing={1.5}
                rounded="full"
                px={2.5}
                py={1.5}
                bg="rgba(8, 29, 31, 0.52)"
                border="1px solid rgba(255,255,255,0.18)"
                backdropFilter="blur(12px)"
              >
                <Box
                  w="7px"
                  h="7px"
                  rounded="full"
                  bg="#6EE7B7"
                  boxShadow="0 0 10px rgba(110,231,183,0.8)"
                />
                <Text
                  color="white"
                  fontSize="9px"
                  fontWeight="800"
                  letterSpacing="0.65px"
                >
                  FOR YOUR PRACTICE
                </Text>
              </HStack>
            </Flex>

            <Box maxW={{ md: "520px" }} pt={{ base: 0, md: 0 }}>
              <HStack
                display={{ base: "none", md: "inline-flex" }}
                spacing={1.5}
                mb={{ base: 2, md: 4 }}
                px={2.5}
                py={1.5}
                rounded="full"
                bg="rgba(255,255,255,0.13)"
                border="1px solid rgba(255,255,255,0.2)"
              >
                <Icon as={RiSparklingFill} color="#A7F3D0" boxSize={3.5} />
                <Text
                  color="white"
                  fontSize="9px"
                  fontWeight="800"
                  letterSpacing="1.1px"
                >
                  {slide.tag}
                </Text>
              </HStack>

              <Text
                color="white"
                fontSize={{ base: "22px", sm: "25px", md: "42px", lg: "50px" }}
                fontWeight="800"
                letterSpacing={{ base: "-0.8px", md: "-1.8px" }}
                lineHeight={{ base: 1.06, md: 1.03 }}
              >
                {slide.headline}
                <br />
                <Text as="span" color="#A7F3D0">
                  {slide.accent}
                </Text>
              </Text>

              <Text
                display={{ base: "none", md: "block" }}
                color="whiteAlpha.800"
                fontSize="sm"
                lineHeight="1.8"
                mt={4}
                maxW="440px"
              >
                {slide.description}
              </Text>

              <HStack spacing={2} mt={{ base: 2, md: 7 }}>
                {SHOWCASE_SLIDES.map((item, index) => (
                  <Button
                    key={item.tag}
                    type="button"
                    aria-label={`Show slide ${index + 1}`}
                    onClick={() => setCurrentSlide(index)}
                    minW={currentSlide === index ? "28px" : "7px"}
                    w={currentSlide === index ? "28px" : "7px"}
                    h="7px"
                    p={0}
                    rounded="full"
                    bg={currentSlide === index ? "#A7F3D0" : "whiteAlpha.600"}
                    _hover={{ bg: "#A7F3D0" }}
                    _active={{ transform: "none" }}
                    transition="all 200ms ease"
                  />
                ))}
              </HStack>

              <HStack
                display={{ base: "none", md: "flex" }}
                spacing={5}
                mt={8}
                pt={5}
                borderTop="1px solid rgba(255,255,255,0.2)"
              >
                {TRUST_POINTS.map(({ icon, label }) => (
                  <HStack key={label} spacing={2}>
                    <Icon as={icon} color="#A7F3D0" boxSize={4} />
                    <Text color="whiteAlpha.900" fontSize="xs" fontWeight="600">
                      {label}
                    </Text>
                  </HStack>
                ))}
              </HStack>
            </Box>
          </Flex>
        </Box>

        <Flex
          flex="1"
          direction="column"
          justify="center"
          align="center"
          minH={0}
          overflow="hidden"
          px={{ base: 5, sm: 8, md: 9, lg: 12 }}
          pt={{ base: 3, sm: 4, md: 10 }}
          pb={{ base: "calc(6px + env(safe-area-inset-bottom, 0px))", md: 10 }}
          bg="white"
        >
          <Box w="100%" maxW="410px">
            {children}

            <HStack
              display={{ base: "none", md: "flex" }}
              justify="center"
              spacing={2}
              mt={9}
              color="gray.500"
            >
              <Icon as={RiShieldCheckLine} color="#16877D" boxSize={4} />
              <Text fontSize="xs" fontWeight="600">
                Your practice data is protected and encrypted
              </Text>
            </HStack>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default AuthenticationLayout;
