"use client"; // Add this for client-side component in Next.js

import { Box, Button, Flex, IconButton, useMediaQuery } from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import { FiBookOpen } from "react-icons/fi";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import HeaderProfile from "./HeaderProfile/HeaderProfile";
import HeaderThemeSwitch from "./HeaderThemeSwitch/HeaderThemeSwitch";
import HeaderLanguageSwitch from "./HeaderLanguageSwitch/HeaderLanguageSwitch";
import stores from "../../../../../store/stores";

const HeaderNavbar = observer(() => {
  const {
    layout: { setOpenMobileSideDrawer },
  } = stores;
  const [isLargerThan1020] = useMediaQuery("(min-width: 1020px)");

  useEffect(() => {
    if (!stores.globalConfigStore?.config?.tutorialDoc) {
      stores.globalConfigStore.fetchGlobalConfig();
    }
  }, []);

  return (
    <Flex
      justifyContent="flex-end"
      alignItems="center"
      gap={{ base: 1.5, sm: 2, lg: 2.5 }}
      pr={{ base: 0.5, md: 2 }}
      minW={0}
    >
      {stores.globalConfigStore?.config?.tutorialDoc && (
        isLargerThan1020 ? (
          <Button
            as="a"
            href={stores.globalConfigStore.config.tutorialDoc}
            target="_blank"
            rel="noopener noreferrer"
            leftIcon={<FiBookOpen />}
            size="sm"
            bgGradient="linear(to-r, purple.500, pink.500)"
            color="white"
            _hover={{ bgGradient: "linear(to-r, purple.600, pink.600)", transform: "translateY(-1px)", shadow: "lg" }}
            _active={{ transform: "translateY(0)" }}
            shadow="md"
            borderRadius="full"
            px={5}
            fontWeight="bold"
          >
            How to use
          </Button>
        ) : (
          <IconButton
            display={{ base: "none", md: "inline-flex" }}
            as="a"
            href={stores.globalConfigStore.config.tutorialDoc}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tutorial"
            title="Tutorial"
            icon={<FiBookOpen />}
            fontSize="15px"
            w={{ base: "32px", sm: "36px", md: "38px" }}
            h={{ base: "32px", sm: "36px", md: "38px" }}
            minW={{ base: "32px", sm: "36px", md: "38px" }}
            borderRadius="10px"
            color="white"
            variant="ghost"
            bg="whiteAlpha.180"
            border="1px solid rgba(255,255,255,0.12)"
            _hover={{ bg: "whiteAlpha.300", transform: "scale(1.05)" }}
            _active={{ bg: "whiteAlpha.400", transform: "scale(0.95)" }}
            transition="all 0.15s ease"
          />
        )
      )}
      {isLargerThan1020 ? (
        <>
          <HeaderLanguageSwitch />
          <HeaderThemeSwitch />
          <HeaderProfile />
        </>
      ) : (
        <>
          <Box display={{ base: "none", md: "block" }}>
            <HeaderLanguageSwitch />
          </Box>
          <HeaderThemeSwitch />
          <HeaderProfile />
          <IconButton
            aria-label="Open navigation menu"
            title="Open navigation menu"
            variant="ghost"
            color="white"
            fontSize="15px"
            w={{ base: "32px", sm: "36px", md: "38px" }}
            h={{ base: "32px", sm: "36px", md: "38px" }}
            minW={{ base: "32px", sm: "36px", md: "38px" }}
            borderRadius="10px"
            bg="whiteAlpha.220"
            border="1px solid rgba(255,255,255,0.18)"
            _hover={{ bg: "whiteAlpha.350", transform: "scale(1.05)" }}
            _active={{ bg: "whiteAlpha.450", transform: "scale(0.95)" }}
            transition="all 0.15s ease"
            onClick={() => setOpenMobileSideDrawer(true)}
            icon={<FaBars />}
          />
        </>
      )}
    </Flex>
  );
});

export default HeaderNavbar;