"use client"; // Add this for client-side component in Next.js

import {
  Avatar,
  Box,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import stores from "../../../../../store/stores";
import SearchBar from "../HeaderNavbar/SearchBar/SearchBar";

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

        <HStack
          ml={{ base: 0, sm: 1 }}
          mr={{ base: 0, sm: 1 }}
          spacing={{ base: 1.5, sm: 2, md: 3 }}
          minW={0}
          alignItems="center"
        >
          {(stores.auth.user?.companyDetail || stores.auth.user?.companyDetails) && (
            <>
              {stores.auth.user?.companyDetail?.logo?.url || stores.auth.user?.companyDetails?.logo?.url ? (
                <Box
                  p="2px"
                  borderRadius="11px"
                  bg="whiteAlpha.350"
                  boxShadow="0 2px 8px rgba(0,0,0,0.18)"
                  backdropFilter="blur(6px)"
                  flexShrink={0}
                >
                  <Image 
                    src={stores.auth.user?.companyDetail?.logo?.url || stores.auth.user?.companyDetails?.logo?.url} 
                    alt={stores.auth.user?.companyDetail?.company_name || stores.auth.user?.companyDetails?.company_name}
                    boxSize={{ base: "32px", md: "36px" }}
                    objectFit="contain"
                    bg="white"
                    borderRadius="9px"
                    p={1}
                  />
                </Box>
              ) : (
                <Avatar 
                  size="sm" 
                  name={stores.auth.user?.companyDetail?.company_name || stores.auth.user?.companyDetails?.company_name} 
                  bg="white"
                  color="teal.600"
                  borderRadius="11px"
                  boxShadow="0 2px 8px rgba(0,0,0,0.18)"
                  boxSize={{ base: "32px", md: "36px" }}
                  flexShrink={0}
                />
              )}

              <Box minW={0} display="flex" flexDirection="column">
                <Text
                  color="white"
                  fontWeight="800"
                  letterSpacing="-0.2px"
                  fontSize={{ base: "13px", sm: "14px", md: "16px" }}
                  whiteSpace="nowrap"
                  noOfLines={1}
                  maxW={{ base: "115px", sm: "160px", md: "none" }}
                >
                  {stores.auth.user?.companyDetail?.company_name || stores.auth.user?.companyDetails?.company_name}
                </Text>
                <HStack spacing={1} display={{ base: "flex", md: "none" }}>
                  <Box w="5px" h="5px" borderRadius="full" bg="#22C55E" boxShadow="0 0 6px #22C55E" />
                  <Text color="whiteAlpha.800" fontSize="9px" fontWeight="600" noOfLines={1}>
                    Active
                  </Text>
                </HStack>
              </Box>
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