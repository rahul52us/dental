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
      fontSize="xl"
      color="white"
      minW={{ base: "36px", sm: "40px" }}
      h={{ base: "36px", sm: "40px" }}
      _hover={{ color: "blue.500", bg: "gray.700" }}
      _active={{ bg: "gray.800" }}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    />
  );
};

export default HeaderThemeSwitch;