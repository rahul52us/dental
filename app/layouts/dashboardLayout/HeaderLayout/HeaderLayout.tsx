"use client"; // Add this for client-side component in Next.js

import { Flex, IconButton } from "@chakra-ui/react";
import { useMediaQuery } from "@chakra-ui/react";
import HeaderNavbar from "./component/HeaderNavbar/HeaderNavbar";
import HeaderLogo from "./component/Logo/HeaderLogo";
import { observer } from "mobx-react-lite";
import { headerHeight, headerPadding } from "../../../component/config/utils/variable";
import { FaSearch } from "react-icons/fa";


const HeaderLayout = observer(() => {
  const [isLargerThan1020] = useMediaQuery("(min-width: 1020px)");

  return (
    <Flex
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      height={headerHeight}
      padding={headerPadding}
      boxShadow="0 4px 15px rgba(0, 0, 0, 0.05)"
      borderBottom="1px solid rgba(255,255,255,0.1)"
      position="relative"
    >
      <Flex flex={1}>
        <HeaderLogo />
      </Flex>

      <Flex zIndex={2} ml="auto">
        <HeaderNavbar />
      </Flex>
    </Flex>
  );
});

export default HeaderLayout;