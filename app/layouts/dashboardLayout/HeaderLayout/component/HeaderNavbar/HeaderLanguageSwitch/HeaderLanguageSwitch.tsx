"use client"; // Add this for client-side component in Next.js

import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  useColorModeValue,
  Divider,
  Box,
  HStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FiGlobe, FiCheck } from "react-icons/fi";

// Define interface for language options
interface LanguageOption {
  value: string;
  label: string;
  nativeLabel: string;
  shortLabel: string;
}


const HeaderLanguageSwitch = () => {
  const { i18n } = useTranslation();
  const menuBgColor = useColorModeValue("white", "gray.800");
  const menuHoverBgColor = useColorModeValue("gray.100", "gray.700");
  const menuActiveBgColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");

  // Define language options with typed structure
  const languageOptions: LanguageOption[] = [
    { value: "en", label: "English", nativeLabel: "English", shortLabel: "EN" },
    { value: "hi", label: "Hindi", nativeLabel: "हिंदी", shortLabel: "HI" },
    { value: "ta", label: "Tamil", nativeLabel: "தமிழ்", shortLabel: "TA" },
    { value: "mr", label: "Marathi", nativeLabel: "मराठी", shortLabel: "MR" },
    { value: "te", label: "Telugu", nativeLabel: "తెలుగు", shortLabel: "TE" },
  ];

  // Handle language change with typed parameter
  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    if (typeof window !== "undefined") { // Check for client-side
      localStorage.setItem("setLanguage", value);
    }
  };

  return (
    <Menu closeOnSelect={true} placement="bottom-end">
      <MenuButton
        as={IconButton}
        icon={<FiGlobe />}
        variant="ghost"
        aria-label="Switch Language"
        fontSize="2xl"
        color="white"
        _hover={{ color: "blue.500", bg: "gray.700" }}
        _active={{ bg: "gray.800" }}
        p={2}
        m={1}
      />
      <Portal>
        <MenuList
          minWidth="260px"
          boxShadow="xl"
          p={2}
          borderRadius="xl"
          bg={menuBgColor}
          zIndex={10}
          border="none"
        >
          {languageOptions.map((option) => {
            const isActive = i18n.language === option.value || (i18n.language === "en-US" && option.value === "en") || (typeof window !== "undefined" && localStorage.getItem("setLanguage") === option.value);
            return (
              <MenuItem
                key={option.value}
                onClick={() => handleLanguageChange(option.value)}
                px={3}
                py={2}
                mb={1}
                _last={{ mb: 0 }}
                bg={isActive ? useColorModeValue("blue.50", "whiteAlpha.100") : "transparent"}
                _hover={{ bg: menuHoverBgColor }}
                _active={{ bg: menuActiveBgColor }}
                rounded="lg"
                transition="all 0.2s"
              >
                <HStack spacing={4} w="full">
                  <Box
                    w={10}
                    h={10}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg={isActive ? "blue.500" : useColorModeValue("gray.100", "gray.700")}
                    color={isActive ? "white" : useColorModeValue("gray.600", "gray.300")}
                    rounded="lg"
                    fontWeight="bold"
                    fontSize="sm"
                    boxShadow={isActive ? "md" : "none"}
                  >
                    {option.shortLabel}
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight={isActive ? "bold" : "semibold"} color={textColor}>
                      {option.label}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={-0.5}>
                      {option.nativeLabel}
                    </Text>
                  </Box>
                  {isActive && <FiCheck color="#3182ce" size={18} />}
                </HStack>
              </MenuItem>
            );
          })}
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default HeaderLanguageSwitch;