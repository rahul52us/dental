"use client"; // Add this for client-side component in Next.js

import { Flex, IconButton, useMediaQuery, useColorModeValue } from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
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

  return (
    <Flex
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      gap={4}
      pr={2}
    >
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
      )}
    </Flex>
  );
});

export default HeaderNavbar;