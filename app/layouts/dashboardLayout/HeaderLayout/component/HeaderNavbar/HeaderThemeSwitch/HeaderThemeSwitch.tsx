"use client";

import { IconButton, useColorMode } from "@chakra-ui/react";
import { BiMoon, BiSun } from "react-icons/bi";

const HeaderThemeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";

  return (
    <IconButton
      icon={isDarkMode ? <BiSun /> : <BiMoon />}
      onClick={toggleColorMode}
      variant="ghost"
      fontSize={{ base: "16px", md: "18px" }}
      color="white"
      w={{ base: "32px", sm: "36px", md: "38px" }}
      h={{ base: "32px", sm: "36px", md: "38px" }}
      minW={{ base: "32px", sm: "36px", md: "38px" }}
      borderRadius="10px"
      bg="whiteAlpha.180"
      border="1px solid rgba(255,255,255,0.12)"
      _hover={{ bg: "whiteAlpha.300", transform: "scale(1.05)" }}
      _active={{ bg: "whiteAlpha.400", transform: "scale(0.95)" }}
      transition="all 0.15s ease"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    />
  );
};

export default HeaderThemeSwitch;