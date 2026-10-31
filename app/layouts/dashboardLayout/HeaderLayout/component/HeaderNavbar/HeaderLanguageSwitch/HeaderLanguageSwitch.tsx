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
  Box,
  HStack,
  VStack,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FiGlobe, FiCheck, FiX } from "react-icons/fi";

// Define interface for language options
interface LanguageOption {
  value: string;
  label: string;
  nativeLabel: string;
  shortLabel: string;
}


const HeaderLanguageSwitch = () => {
  const { i18n } = useTranslation();
  const [isMobile] = useMediaQuery("(max-width: 767px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const menuBgColor = useColorModeValue("white", "gray.800");
  const menuHoverBgColor = useColorModeValue("gray.100", "gray.700");
  const menuActiveBgColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  const activeItemBgColor = useColorModeValue("blue.50", "whiteAlpha.100");
  const inactiveBadgeBgColor = useColorModeValue("gray.100", "gray.700");
  const inactiveBadgeColor = useColorModeValue("gray.600", "gray.300");
  const drawerBgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.200");

  // Define language options with typed structure
  const languageOptions: LanguageOption[] = [
    { value: "en", label: "English", nativeLabel: "English", shortLabel: "EN" },
    { value: "hi", label: "Hindi", nativeLabel: "हिंदी", shortLabel: "HI" },
    { value: "ta", label: "Tamil", nativeLabel: "தமிழ்", shortLabel: "TA" },
    { value: "mr", label: "Marathi", nativeLabel: "मराठी", shortLabel: "MR" },
    { value: "te", label: "Telugu", nativeLabel: "తెలుగు", shortLabel: "TE" },
    { value: "bn", label: "Bengali", nativeLabel: "বাংলা", shortLabel: "BN" },
    { value: "or", label: "Odia", nativeLabel: "ଓଡ଼ିଆ", shortLabel: "OR" },
    { value: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", shortLabel: "GU" },
    { value: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", shortLabel: "KN" },
    { value: "ml", label: "Malayalam", nativeLabel: "മലയാളം", shortLabel: "ML" },
  ];

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("setLanguage", value);
    }
  };

  const isLanguageActive = (value: string) =>
    i18n.language === value ||
    (i18n.language === "en-US" && value === "en") ||
    (typeof window !== "undefined" && localStorage.getItem("setLanguage") === value);

  const languageButton = (
    <MenuButton
      as={IconButton}
      icon={<FiGlobe />}
      variant="ghost"
      aria-label="Switch Language"
      fontSize="xl"
      color="white"
      minW={{ base: "36px", sm: "40px" }}
      h={{ base: "36px", sm: "40px" }}
      title="Switch language"
      _hover={{ color: "blue.500", bg: "gray.700" }}
      _active={{ bg: "gray.800" }}
    />
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          icon={<FiGlobe />}
          onClick={onOpen}
          variant="ghost"
          aria-label="Switch Language"
          fontSize="xl"
          color="white"
          minW="40px"
          h="40px"
          title="Switch language"
          _hover={{ color: "blue.500", bg: "gray.700" }}
          _active={{ bg: "gray.800" }}
        />
        <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="md">
          <DrawerOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
          <DrawerContent
            bg={drawerBgColor}
            borderTopRadius="24px"
            height="auto"
            maxH="min(78vh, 640px)"
            pb="env(safe-area-inset-bottom)"
            overflow="hidden"
            boxShadow="0 -12px 40px rgba(15, 23, 42, 0.18)"
          >
            <Box
              width="38px"
              height="4px"
              bg={useColorModeValue("gray.300", "gray.600")}
              borderRadius="full"
              mx="auto"
              mt={3}
            />
            <DrawerCloseButton
              top={4}
              right={4}
              borderRadius="full"
              minW="40px"
              h="40px"
              aria-label="Close language selection"
            >
              <FiX />
            </DrawerCloseButton>
            <DrawerHeader px={5} pt={5} pb={4}>
              <Text fontSize="xl" fontWeight="800" color={textColor}>
                Choose language
              </Text>
              <Text mt={1} fontSize="sm" fontWeight="normal" color={secondaryTextColor}>
                Select your preferred language
              </Text>
            </DrawerHeader>
            <DrawerBody px={4} pt={0} pb={4} overflowY="auto">
              <VStack align="stretch" spacing={2}>
                {languageOptions.map((option) => {
                  const isActive = isLanguageActive(option.value);
                  return (
                    <Box
                      as="button"
                      type="button"
                      key={option.value}
                      aria-pressed={isActive}
                      onClick={() => {
                        handleLanguageChange(option.value);
                        onClose();
                      }}
                      display="flex"
                      alignItems="center"
                      width="100%"
                      minH="56px"
                      px={3}
                      py={2}
                      bg={isActive ? activeItemBgColor : "transparent"}
                      border="1px solid"
                      borderColor={isActive ? "blue.200" : borderColor}
                      borderRadius="16px"
                      textAlign="left"
                      transition="background 0.15s ease, border-color 0.15s ease, transform 0.15s ease"
                      _hover={{ bg: isActive ? activeItemBgColor : menuHoverBgColor }}
                      _active={{ bg: menuActiveBgColor, transform: "scale(0.99)" }}
                      _focusVisible={{ outline: "2px solid", outlineColor: "blue.400", outlineOffset: "2px" }}
                    >
                      <Box
                        w="38px"
                        h="38px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg={isActive ? "blue.500" : inactiveBadgeBgColor}
                        color={isActive ? "white" : inactiveBadgeColor}
                        borderRadius="12px"
                        fontWeight="bold"
                        fontSize="xs"
                        flexShrink={0}
                      >
                        {option.shortLabel}
                      </Box>
                      <Box flex={1} minW={0} ml={3}>
                        <Text fontSize="sm" fontWeight="700" color={textColor}>
                          {option.label}
                        </Text>
                        <Text fontSize="xs" color={secondaryTextColor}>
                          {option.nativeLabel}
                        </Text>
                      </Box>
                      {isActive && <FiCheck color="#3182ce" size={20} />}
                    </Box>
                  );
                })}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Menu closeOnSelect={true} placement="bottom-end">
      {languageButton}
      <Portal>
        <MenuList
          width="min(92vw, 450px)"
          maxW="calc(100vw - 16px)"
          minW={0}
          maxH="min(70vh, 560px)"
          overflowY="auto"
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
          gap={2}
          css={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cbd5e1',
              borderRadius: '24px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#94a3b8',
            },
          }}
          boxShadow="xl"
          p={3}
          borderRadius="xl"
          bg={menuBgColor}
          zIndex={10}
          border="none"
        >
          {languageOptions.map((option) => {
            const isActive = isLanguageActive(option.value);
            return (
              <MenuItem
                key={option.value}
                onClick={() => handleLanguageChange(option.value)}
                px={3}
                py={2}
                bg={isActive ? activeItemBgColor : "transparent"}
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
                    bg={isActive ? "blue.500" : inactiveBadgeBgColor}
                    color={isActive ? "white" : inactiveBadgeColor}
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