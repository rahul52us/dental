"use client"; // Add this for client-side component in Next.js

import { Box, Flex, IconButton, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import stores from "../../../../../store/stores";
import SearchBar from "../HeaderNavbar/SearchBar/SearchBar";
import { Avatar, Text, HStack, Image } from "@chakra-ui/react";

const HeaderLogo = observer(() => {
  const isLargerThanXl = useBreakpointValue({ lg: true }) ?? false; // Added default value for SSR

  const {
    layout: { fullScreenMode, openDashSidebarFun, isCallapse },
  } = stores;

  const hoverColor = useColorModeValue("brand.500", "brand.200");
  const hoverBg = useColorModeValue("brand.50", "gray.700");
  const activeBg = useColorModeValue("brand.100", "gray.800");

  return (
    <Flex width="100%" alignItems="center" justifyContent={{ base: "flex-start", md: "space-between" }} display="flex" ml={{ base: 0, md: 2 }}>
      <Flex alignItems="center">
        {isLargerThanXl && (
          <Flex alignItems="center">
            <IconButton
              variant="ghost"
              aria-label="Arrow"
              fontSize="2xl"
              color="white"
              _hover={{ color: hoverColor, bg: hoverBg }}
              _active={{ bg: activeBg }}
              icon={
                isCallapse ? (
                  <BiRightArrowAlt fontSize={25} />
                ) : (
                  <BiLeftArrowAlt fontSize={25} />
                )
              }
              size="lg"
              sx={{ marginRight: "1rem", marginTop: "2px" }}
              onClick={() => {
                openDashSidebarFun();
              }}
            />
            <IconButton
              icon={
                fullScreenMode ? (
                  <BiRightArrowAlt fontSize={25} />
                ) : (
                  <BiLeftArrowAlt fontSize={25} />
                )
              }
              onClick={() => openDashSidebarFun()}
              variant="ghost"
              size="lg"
              sx={{ marginRight: "1rem", marginTop: "2px" }}
              aria-label="open the drawer button"
              display="none"
            />
          </Flex>
        )}

        <HStack ml={isLargerThanXl ? 0 : 2} mr={2} spacing={4} display="flex">
          {(stores.auth.user?.companyDetail || stores.auth.user?.companyDetails) && (
            <>
              {stores.auth.user?.companyDetail?.logo?.url || stores.auth.user?.companyDetails?.logo?.url ? (
                <Image 
                  src={stores.auth.user?.companyDetail?.logo?.url || stores.auth.user?.companyDetails?.logo?.url} 
                  alt={stores.auth.user?.companyDetail?.company_name || stores.auth.user?.companyDetails?.company_name}
                  boxSize={{ base: "36px", md: "36px" }}
                  objectFit="contain"
                  bg="white"
                  borderRadius="full"
                  p={1}
                  boxShadow="sm"
                />
              ) : (
                <Avatar 
                  size="sm" 
                  name={stores.auth.user?.companyDetail?.company_name || stores.auth.user?.companyDetails?.company_name} 
                  bg="white"
                  color="brand.500"
                  borderRadius="full"
                  boxShadow="sm"
                />
              )}
              <Text color="white" fontWeight="800" letterSpacing="0.02em" fontSize={{ base: "lg", md: "xl" }} whiteSpace="nowrap" maxW={{ base: "150px", md: "none" }} isTruncated>
                {stores.auth.user?.companyDetail?.company_name || stores.auth.user?.companyDetails?.company_name}
              </Text>
            </>
          )}
        </HStack>
      </Flex>

      <Box display={{ base: "none", md: "block" }}>
        <SearchBar />
      </Box>
      <Box></Box>
      {/* <Input
        type="text"
        value=""
        placeholder="Search here"
        w={isLargerThanXl ? "90%" : "95%"}
      /> */}
    </Flex>
  );
});

export default HeaderLogo;