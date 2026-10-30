"use client"; // Add this for client-side component in Next.js

import { Flex, IconButton, useMediaQuery, useColorModeValue, Tooltip, Button } from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import { FiBookOpen } from "react-icons/fi";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import HeaderProfile from "./HeaderProfile/HeaderProfile";
import HeaderNotification from "./HeaderNotification/HeaderNotification";
import HeaderThemeSwitch from "./HeaderThemeSwitch/HeaderThemeSwitch";
import HeaderLanguageSwitch from "./HeaderLanguageSwitch/HeaderLanguageSwitch";
// import HeaderChatMessage from "./HeaderChatMessage/HeaderChatMessage";
// import CartContainer from "./CartContainer/CartContainer";
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
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      gap={{ base: 2, md: 4 }}
      pr={{ base: 1, md: 2 }}
    >
      {stores.globalConfigStore?.config?.tutorialDoc && (
        <Button
          as="a"
          href={stores.globalConfigStore?.config?.tutorialDoc}
          target="_blank"
          leftIcon={<FiBookOpen />}
          size="xs"
          display={{ base: "none", sm: "inline-flex" }}
          bgGradient="linear(to-r, purple.500, pink.500)"
          color="white"
          _hover={{ bgGradient: "linear(to-r, purple.600, pink.600)", transform: "translateY(-1px)", shadow: "lg" }}
          _active={{ transform: "translateY(0)" }}
          shadow="md"
          borderRadius="full"
          px={{ base: 2.5, md: 5 }}
          fontWeight="bold"
          mr={1}
        >
          {isLargerThan1020 ? "How to use" : "Tutorial"}
        </Button>
      )}
      {isLargerThan1020 ? (
        <>
          <HeaderLanguageSwitch />
          <HeaderThemeSwitch />
          {/* <HeaderChatMessage />
          <HeaderNotification />
          <CartContainer /> */}
          {/* <HeaderNotification /> */}
          <HeaderProfile />
        </>
      ) : (
        <Flex alignItems="center" gap={2}>
          <HeaderProfile />
          <IconButton
            aria-label="Menu"
            variant="ghost"
            color="white"
            fontSize="2xl"
            _hover={{ bg: "whiteAlpha.200" }}
            _active={{ bg: "whiteAlpha.300" }}
            onClick={() => setOpenMobileSideDrawer(true)}
            icon={<FaBars />}
          />
        </Flex>
      )}
    </Flex>
  );
});

export default HeaderNavbar;