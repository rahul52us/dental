"use client";

import { Box, Flex, Text, VStack, HStack, Heading } from "@chakra-ui/react";
import React from "react";
import { FaTooth } from "react-icons/fa";
import {
  RiShieldCheckLine,
  RiTimeLine,
  RiHeartPulseLine,
} from "react-icons/ri";

const HERO_IMAGE =
  "https://salisburydentist.co.uk/wp-content/uploads/2025/04/woman-patient-dentist-1-scaled.jpg";

const FEATURES = [
  { icon: RiShieldCheckLine, label: "Secure" },
  { icon: RiTimeLine, label: "Fast" },
  { icon: RiHeartPulseLine, label: "Reliable" },
];

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box position="relative" h="100dvh" w="100%" overflow="hidden" bg="gray.50">
      {/* Decorative blobs */}
      <Box
        position="absolute"
        top="-15%"
        left="-10%"
        w="55vw"
        h="55vw"
        maxW="600px"
        maxH="600px"
        bg="teal.200"
        opacity={0.35}
        filter="blur(120px)"
        rounded="full"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-15%"
        right="-10%"
        w="55vw"
        h="55vw"
        maxW="600px"
        maxH="600px"
        bg="blue.200"
        opacity={0.35}
        filter="blur(120px)"
        rounded="full"
        zIndex={0}
      />

      <Flex
        position="relative"
        zIndex={1}
        direction={{ base: "column", md: "row" }}
        h="100dvh"
        w="100%"
        p={{ base: 0, md: 5 }}
        gap={{ base: 0, md: 5 }}
      >
        {/* ================= HERO / IMAGE ================= */}
        <Box
          // INCREASED IMAGE SIZE ON DESKTOP (flex 1.5 vs 1)
          flex={{ base: "none", md: "1.5" }}
          h={{ base: "38dvh", md: "auto" }}
          minH={{ base: "220px", md: 0 }}
          flexShrink={0}
          position="relative"
          rounded={{ base: "none", md: "3xl" }}
          overflow="hidden"
          bgImage={`url(${HERO_IMAGE})`}
          bgSize="cover"
          bgPosition="center"
          bgColor="teal.900"
        >
          {/* Overlay */}
          <Box
            position="absolute"
            inset={0}
            bgGradient={{
              base: "linear(to-b, rgba(13,79,79,0.30), rgba(13,79,79,0.92))",
              md: "linear(to-t, rgba(13,79,79,0.92), rgba(13,79,79,0.35), rgba(13,79,79,0.05))",
            }}
          />

          {/* Desktop hero content */}
          <Box
            display={{ base: "none", md: "block" }}
            position="relative"
            h="100%"
            p={8}
          >
            <HStack spacing={3} position="absolute" top={8} left={8}>
              <Flex
                w="44px"
                h="44px"
                rounded="2xl"
                bg="whiteAlpha.300"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.400"
                align="center"
                justify="center"
              >
                <FaTooth size={22} color="white" />
              </Flex>
              <Text
                color="white"
                fontWeight="800"
                fontSize="lg"
                letterSpacing="wide"
              >
                DentalCare
              </Text>
            </HStack>

            <VStack
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              align="start"
              spacing={4}
              p={10} // Increased padding to balance large image
            >
              <Heading
                color="white"
                fontSize="5xl" // Made text larger to fit the bigger image
                fontWeight="extrabold"
                lineHeight="1.15"
                letterSpacing="tight"
              >
                Your Smile,
                <br />
                Our Priority.
              </Heading>
              <Text
                color="whiteAlpha.900"
                fontSize="md"
                maxW="400px"
                lineHeight="tall"
              >
                Manage appointments, patients, and your dental practice — all in
                one beautifully simple place.
              </Text>
              <HStack spacing={5} pt={3}>
                {FEATURES.map(({ icon: Icon, label }) => (
                  <HStack key={label} spacing={2}>
                    <Flex
                      p={2}
                      rounded="lg"
                      bg="whiteAlpha.200"
                      backdropFilter="blur(8px)"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                    >
                      <Icon color="white" size={16} />
                    </Flex>
                    <Text color="white" fontSize="sm" fontWeight="600">
                      {label}
                    </Text>
                  </HStack>
                ))}
              </HStack>
            </VStack>
          </Box>

          {/* Mobile hero content */}
          <Box
            display={{ base: "flex", md: "none" }}
            position="relative"
            h="100%"
            p={5}
            flexDirection="column"
            justifyContent="space-between"
          >
            <HStack spacing={2}>
              <Flex
                w="38px"
                h="38px"
                rounded="xl"
                bg="whiteAlpha.300"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.400"
                align="center"
                justify="center"
              >
                <FaTooth size={18} color="white" />
              </Flex>
              <Text
                color="white"
                fontWeight="800"
                fontSize="md"
                letterSpacing="wide"
              >
                DentalCare
              </Text>
            </HStack>

            <VStack align="start" spacing={1} pb={8}>
              <Heading
                color="white"
                fontSize="2xl"
                fontWeight="extrabold"
                lineHeight="1.2"
              >
                Your Smile,
                <br />
                Our Priority.
              </Heading>
              <Text color="whiteAlpha.800" fontSize="xs">
                Sign in to continue
              </Text>
            </VStack>
          </Box>
        </Box>

        {/* ================= FORM PANEL ================= */}
        <Flex
          flex="1" // TAKES LESS SPACE THAN IMAGE ON DESKTOP
          minH={0}
          bg="white"
          borderTopRadius="3xl"
          borderBottomRadius={{ base: 0, md: "3xl" }}
          // PULLED UP HIGHER ON MOBILE (-45px)
          mt={{ base: "-45px", md: 0 }}
          position="relative"
          zIndex={2}
          boxShadow={{
            base: "0 -10px 30px rgba(0,0,0,0.15)",
            md: "xl",
          }}
          align="center"
          justify="center"
          // REDUCED PADDING SO FORM FITS NICELY IN SMALLER SPACE
          px={{ base: 5, md: 6, lg: 8 }}
          py={{ base: 6, md: 8 }}
          overflowX="hidden"
          overflowY={{ base: "auto", md: "hidden" }}
        >
          {children}
        </Flex>
      </Flex>
    </Box>
  );
};

export default AuthenticationLayout;