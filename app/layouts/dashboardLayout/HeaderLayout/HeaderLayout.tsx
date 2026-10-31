"use client"; // Add this for client-side component in Next.js

import { Flex } from "@chakra-ui/react";
import HeaderNavbar from "./component/HeaderNavbar/HeaderNavbar";
import HeaderLogo from "./component/Logo/HeaderLogo";
import { observer } from "mobx-react-lite";
import { headerHeight } from "../../../component/config/utils/variable";

const HeaderLayout = observer(() => {
  return (
    <Flex
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      height={headerHeight}
      px={{ base: 1, sm: 2, md: 3 }}
      boxShadow="0 4px 15px rgba(0, 0, 0, 0.05)"
      borderBottom="1px solid rgba(255,255,255,0.1)"
      position="relative"
      minW={0}
    >
      <Flex flex={1} minW={0}>
        <HeaderLogo />
      </Flex>

      <Flex zIndex={2} ml="auto" minW={0}>
        <HeaderNavbar />
      </Flex>
    </Flex>
  );
});

export default HeaderLayout;