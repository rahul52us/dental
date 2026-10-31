"use client"; // Add this for client-side component in Next.js

import { Button, Flex, IconButton, useMediaQuery } from "@chakra-ui/react";
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
      gap={isLargerThan1020 ? 4 : 0}
      pr={{ base: 0, md: 1 }}
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
            as="a"
            href={stores.globalConfigStore.config.tutorialDoc}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tutorial"
            title="Tutorial"
            icon={<FiBookOpen />}
            size="sm"
            minW={{ base: "36px", sm: "40px" }}
            h={{ base: "36px", sm: "40px" }}
            color="white"
            variant="ghost"
            _hover={{ bg: "whiteAlpha.200" }}
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
          <HeaderLanguageSwitch />
          <HeaderThemeSwitch />
          <HeaderProfile />
          <IconButton
            aria-label="Open navigation menu"
            title="Open navigation menu"
            variant="ghost"
            color="white"
            fontSize="xl"
            minW={{ base: "36px", sm: "40px" }}
            h={{ base: "36px", sm: "40px" }}
            _hover={{ bg: "whiteAlpha.200" }}
            _active={{ bg: "whiteAlpha.300" }}
            onClick={() => setOpenMobileSideDrawer(true)}
            icon={<FaBars />}
          />
        </>
      )}
    </Flex>
  );
});

export default HeaderNavbar;