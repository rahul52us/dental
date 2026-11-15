"use client"; // Add this for client-side component in Next.js

import {
  Flex,
  IconButton,
  useMediaQuery,
  useColorModeValue,
  Tooltip,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Box,
  Text,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import { FiBookOpen, FiDownload, FiExternalLink } from "react-icons/fi";
import { useEffect, useState } from "react";
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
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    if (!stores.globalConfigStore?.config?.tutorialDoc) {
      stores.globalConfigStore.fetchGlobalConfig();
    }
  }, []);

  const rawTutorialUrl = stores.globalConfigStore?.config?.tutorialDoc || "";
  const resolvedTutorialUrl = rawTutorialUrl;

  return (
    <>
      <Flex
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap={{ base: 2, md: 4 }}
        pr={{ base: 1, md: 2 }}
      >
        {isLargerThan1020 ? (
          <>
            {rawTutorialUrl && (
              <Button
                onClick={() => setIsTutorialOpen(true)}
                leftIcon={<FiBookOpen />}
                size="xs"
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
                How to use
              </Button>
            )}
            <HeaderLanguageSwitch />
            <HeaderThemeSwitch />
            {/* <HeaderChatMessage />
            <HeaderNotification />
            <CartContainer /> */}
            {/* <HeaderNotification /> */}
            <HeaderProfile />
          </>
        ) : (
          <Flex alignItems="center" gap={1.5}>
            {rawTutorialUrl && (
              <Tooltip label="How to use / Tutorial" hasArrow placement="bottom">
                <IconButton
                  aria-label="How to use"
                  size="sm"
                  variant="solid"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.600, pink.600)", transform: "scale(1.05)" }}
                  _active={{ transform: "scale(0.95)" }}
                  shadow="sm"
                  borderRadius="full"
                  icon={<FiBookOpen size={16} />}
                  onClick={() => setIsTutorialOpen(true)}
                />
              </Tooltip>
            )}
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

      {/* Tutorial Document Drawer */}
      <Drawer
        isOpen={isTutorialOpen}
        placement="right"
        onClose={() => setIsTutorialOpen(false)}
      >
        <DrawerOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
        <DrawerContent
          bg="gray.100"
          w={{ base: "100%", md: "70%" }}
          maxW={{ base: "100%", md: "70vw" }}
        >
          <DrawerHeader
            bg="white"
            borderBottomWidth="1px"
            borderColor="gray.200"
            py={{ base: 2.5, md: 4 }}
            px={{ base: 3, md: 6 }}
            shadow="sm"
          >
            <Flex justify="space-between" align="center" w="full">
              <HStack spacing={{ base: 2, md: 3 }} minW={0} flex="1">
                <Box p={{ base: 1.5, md: 2 }} bg="purple.50" color="purple.600" borderRadius="lg" flexShrink={0}>
                  <FiBookOpen size={18} />
                </Box>
                <Box minW={0}>
                  <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="extrabold" color="gray.800" isTruncated>
                    How to Use
                  </Text>
                  <Text fontSize="2xs" color="gray.500" fontWeight="500" display={{ base: "none", sm: "block" }}>
                    System Tutorial & Guide
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={2} flexShrink={0}>
                {resolvedTutorialUrl && (
                  <Button
                    as="a"
                    href={resolvedTutorialUrl}
                    download={resolvedTutorialUrl.toLowerCase().includes(".doc") ? "System_Tutorial.docx" : "System_Tutorial.pdf"}
                    target="_blank"
                    size="xs"
                    colorScheme="purple"
                    leftIcon={<FiDownload />}
                    borderRadius="full"
                    px={{ base: 2.5, md: 4 }}
                    h="30px"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    Download
                  </Button>
                )}
                <IconButton
                  aria-label="Close Drawer"
                  size="sm"
                  variant="ghost"
                  borderRadius="full"
                  icon={<Icon as={FaBars} style={{ display: 'none' }} />} // fallback
                  onClick={() => setIsTutorialOpen(false)}
                  display="none"
                />
                <DrawerCloseButton position="relative" top="0" right="0" size="sm" />
              </HStack>
            </Flex>
          </DrawerHeader>

          <DrawerBody p={{ base: 2, md: 6 }} display="flex" flexDirection="column" alignItems="center">
            {resolvedTutorialUrl ? (
              <Box
                w="100%"
                h="100%"
                bg="white"
                borderRadius="2xl"
                overflow="hidden"
                shadow="xl"
                border="1px solid"
                borderColor="gray.200"
                flex="1"
                display="flex"
                flexDirection="column"
              >
                {(() => {
                  const urlLower = resolvedTutorialUrl.toLowerCase();
                  const isWordDoc = urlLower.includes(".doc") || urlLower.includes(".docx");
                  const fileName = isWordDoc ? "System_Tutorial.docx" : "System_Tutorial.pdf";

                  if (isWordDoc) {
                    return (
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        h="100%"
                        p={{ base: 6, md: 10 }}
                        textAlign="center"
                        bg="purple.50"
                        flex="1"
                      >
                        <Box p={{ base: 3, md: 4 }} bg="white" borderRadius="2xl" shadow="md" mb={4} color="purple.600">
                          <FiBookOpen size={40} />
                        </Box>
                        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="extrabold" color="gray.800" mb={2}>
                          Tutorial Document
                        </Text>
                        <Text fontSize="sm" color="gray.600" maxW="450px" mb={6}>
                          Click below to download and view the tutorial guide.
                        </Text>
                        <Button
                          as="a"
                          href={resolvedTutorialUrl}
                          download={fileName}
                          colorScheme="purple"
                          size="md"
                          leftIcon={<FiDownload />}
                          borderRadius="full"
                          px={8}
                          shadow="md"
                        >
                          Download Tutorial
                        </Button>
                      </Flex>
                    );
                  }

                  // Default for PDF: native browser viewer + fallback helper for mobile/blocked iframes
                  return (
                    <Box position="relative" w="100%" h="100%" flex="1">
                      <iframe
                        title="Tutorial Preview"
                        src={`${resolvedTutorialUrl}#toolbar=1&navpanes=0&view=FitH`}
                        width="100%"
                        height="100%"
                        style={{ border: "none" }}
                      />
                      {/* Mobile / Fallback banner at bottom in case browser cannot preview PDF */}
                      <Flex
                        display={{ base: "flex", md: "none" }}
                        p={2.5}
                        bg="gray.50"
                        borderTop="1px solid"
                        borderColor="gray.200"
                        justify="space-between"
                        align="center"
                      >
                        <Text fontSize="xs" color="gray.600" fontWeight="500">
                          Unable to preview?
                        </Text>
                        <Button
                          as="a"
                          href={resolvedTutorialUrl}
                          download={fileName}
                          size="xs"
                          colorScheme="purple"
                          leftIcon={<FiDownload />}
                          borderRadius="full"
                          px={3}
                        >
                          Direct Download
                        </Button>
                      </Flex>
                    </Box>
                  );
                })()}
              </Box>
            ) : (
              <Flex align="center" justify="center" h="50vh" direction="column" color="gray.500">
                <FiBookOpen size={48} />
                <Text mt={4} fontSize="md" fontWeight="bold">No tutorial document found</Text>
              </Flex>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

export default HeaderNavbar;