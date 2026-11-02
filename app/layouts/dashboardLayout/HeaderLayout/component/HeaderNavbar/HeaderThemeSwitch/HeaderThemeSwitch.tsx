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
      fontSize={{ base: "17px", md: "19px" }}
      color="white"
      w={{ base: "36px", md: "40px" }}
      h={{ base: "36px", md: "40px" }}
      minW={{ base: "36px", md: "40px" }}
      borderRadius="full"
      bg="whiteAlpha.150"
      _hover={{ bg: "whiteAlpha.300", transform: "translateY(-1px)" }}
      _active={{ bg: "whiteAlpha.400", transform: "scale(0.95)" }}
      transition="all 0.2s ease"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    />
  );
};

export default HeaderThemeSwitch;