'use client'
import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Flex,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  VStack,
  Text,
  useColorModeValue,
  SimpleGrid,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import { SketchPicker } from "react-color";
import { FaPalette } from "react-icons/fa";
import { EditIcon, CheckIcon } from "@chakra-ui/icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
} from "@chakra-ui/react";

interface ColorPickerProps {
  label: string;
  color: any;
  onChangeComplete: any;
}

export const COLOR_SUGGESTIONS = [
  { light: "#3182CE", dark: "#2C5282", label: "Dental Blue" }, // Vibrant blue
  { light: "#38B2AC", dark: "#2C7A7B", label: "Hygienic Teal" }, // Vibrant teal
  { light: "#48BB78", dark: "#2F855A", label: "Fresh Green" }, // Vibrant green
  { light: "#667EEA", dark: "#5A67D8", label: "Indigo Trust" }, // Indigo
  { light: "#ED64A6", dark: "#B83280", label: "Care Pink" },    // Pinkish/Purple
  { light: "#F6AD55", dark: "#DD6B20", label: "Warm Gold" },    // Warmth
  { light: "#FC8181", dark: "#E53E3E", label: "Vital Red" },    // Health
  { light: "#9F7AEA", dark: "#805AD5", label: "Royal Plum" },   // Deep purple
  { light: "#A0AEC0", dark: "#4A5568", label: "Modern Slate" }, // Gray/Steel
  { light: "#4FD1C5", dark: "#319795", label: "Aqua Clean" },   // Cyan-Teal
  { light: "#718096", dark: "#2D3748", label: "Deep Sea" },     // Dark grayish-blue
  { light: "#4299E1", dark: "#3182CE", label: "Trust Blue" },   // Solid blue
];

const ColorBox: React.FC<{ color: string; onClick: () => void; isSelected: boolean }> = ({
  color,
  onClick,
  isSelected,
}) => (
  <Tooltip label={color} placement="top" hasArrow>
    <Box
      width="50px"
      height="50px"
      bg={color}
      borderRadius="md"
      cursor="pointer"
      onClick={onClick}
      _hover={{ transform: "scale(1.1)", transition: "0.2s", boxShadow: "lg" }}
      border={isSelected ? "3px solid teal" : "none"}
      boxShadow="md"
      transition="all 0.2s" // Added smooth transition
    />
  </Tooltip>
);

const ColorPickerComponent: React.FC<ColorPickerProps> = ({
  color,
  onChangeComplete,
}) => {
  const handleSuggestionClick = (sug: { light: string; dark: string }) => {
    onChangeComplete(sug);
  };

  const selectedBg = useColorModeValue("blue.50", "whiteAlpha.200");
  const borderColor = useColorModeValue("gray.200", "darkBrand.200");
  const normalBg = useColorModeValue("white", "darkBrand.100");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const normalTextColor = useColorModeValue("gray.700", "gray.300");
  const selectedTextColor = useColorModeValue("blue.600", "blue.200");

  return (
    <SimpleGrid columns={{ base: 4, sm: 4, md: 3 }} spacing={{ base: 2, md: 3 }} w="100%">
      {COLOR_SUGGESTIONS.map((sug, index) => {
        const isSelected =
          color?.light?.toLowerCase() === sug.light.toLowerCase() &&
          color?.dark?.toLowerCase() === sug.dark.toLowerCase();
        return (
          <VStack
            key={index}
            as="button"
            type="button"
            p={{ base: 2, md: 2 }}
            borderRadius={{ base: "xl", md: "md" }}
            border={{ base: "2px solid", md: "1px solid" }}
            borderColor={isSelected ? "blue.500" : borderColor}
            bg={isSelected ? selectedBg : normalBg}
            onClick={() => handleSuggestionClick(sug)}
            spacing={{ base: 1.5, md: 1 }}
            _hover={{
              transform: { base: "translateY(-2px)", md: "none" },
              shadow: { base: "md", md: "none" },
              bg: isSelected ? selectedBg : hoverBg,
              borderColor: isSelected ? "blue.500" : "blue.200",
            }}
            transition="all 0.2s ease"
            align="center"
            position="relative"
            boxShadow={isSelected ? { base: "md", md: "none" } : "none"}
          >
            <Box
              w={{ base: "34px", md: "24px" }}
              h={{ base: "34px", md: "24px" }}
              borderRadius="full"
              bg={sug.light}
              border="2px solid"
              borderColor="white"
              boxShadow="sm"
              position="relative"
              overflow="hidden"
              flexShrink={0}
            >
              {/* Dark mode wedge indicator */}
              <Box
                position="absolute"
                bottom={0}
                right={0}
                w="100%"
                h="100%"
                bg={sug.dark}
                clipPath="polygon(100% 0, 100% 100%, 0 100%)"
              />
              {isSelected && (
                <Flex
                  position="absolute"
                  inset={0}
                  align="center"
                  justify="center"
                  bg="blackAlpha.300"
                  borderRadius="full"
                  zIndex={2}
                >
                  <CheckIcon color="white" boxSize={{ base: 2.5, md: 2 }} />
                </Flex>
              )}
            </Box>
            <Text
              fontSize={{ base: "9.5px", md: "xs" }}
              fontWeight={isSelected ? { base: "700", md: "bold" } : { base: "700", md: "normal" }}
              color={isSelected ? selectedTextColor : normalTextColor}
              textAlign="center"
              lineHeight="1.2"
              noOfLines={{ base: 2, md: 1 }}
              maxW={{ base: "none", md: "80px" }}
              h={{ base: "24px", md: "auto" }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {sug.label}
            </Text>
          </VStack>
        );
      })}
    </SimpleGrid>
  );
};

export default ColorPickerComponent;
