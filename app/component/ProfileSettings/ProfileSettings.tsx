import React from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  useColorModeValue,
  Flex,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";
import { sidebarDatas, sidebarFooterData } from "../../layouts/dashboardLayout/SidebarLayout/utils/SidebarItems";
import ColorPickerComponent, { COLOR_SUGGESTIONS } from "../common/ColorPicker/ColorPickerComponent";
import { DeleteIcon } from "@chakra-ui/icons";
import { FiLayers } from "react-icons/fi";

const ProfileSettings = observer(() => {
  const {
    themeStore: { themeConfig, setThemeConfig }
  } = stores;

  const allSidebarItems = [...sidebarDatas, ...sidebarFooterData];

  const handleColorChange = (name: string, newColor: { light: string; dark: string }) => {
    setThemeConfig(`sidebarColors.${name}`, newColor);
  };

  const handleResetColor = (name: string) => {
    const currentColors = themeConfig.sidebarColors || {};
    const newColors = { ...currentColors };
    delete newColors[name];
    setThemeConfig("sidebarColors", newColors);
  };

  const getColorInfo = (name: string) => {
    const customColor = themeConfig.sidebarColors?.[name];
    if (!customColor) return null;
    const match = COLOR_SUGGESTIONS.find(
      (s) => s.light.toLowerCase() === customColor.light?.toLowerCase() && s.dark.toLowerCase() === customColor.dark?.toLowerCase()
    );
    return {
      label: match?.label || "Custom",
      light: customColor.light,
      dark: customColor.dark
    };
  };

  // --- Mobile Accordion Item Renderer ---
  const renderMobileAccordionItem = (item: any, isSubItem = false) => {
    const colorInfo = getColorInfo(item.name);
    return (
      <AccordionItem
        key={item.id}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="16px"
        mb={2.5}
        overflow="hidden"
        bg="white"
        shadow="xs"
      >
        <h2>
          <AccordionButton
            px={3}
            py={2.5}
            _hover={{ bg: "gray.50" }}
            _expanded={{ bg: "blue.50" }}
            transition="all 0.15s ease"
          >
            <Flex justify="space-between" align="center" width="100%" pr={1} gap={2}>
              <HStack spacing={3} minW={0} flex={1}>
                {item.icon && (
                  <Box
                    p={2}
                    borderRadius="xl"
                    bg={colorInfo ? colorInfo.light : "gray.100"}
                    color={colorInfo ? "white" : "gray.600"}
                    flexShrink={0}
                    fontSize="14px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow={colorInfo ? "0 2px 8px rgba(0,0,0,0.15)" : "none"}
                    transition="all 0.2s"
                  >
                    {React.isValidElement(item.icon) ? item.icon : <Icon as={item.icon} />}
                  </Box>
                )}
                <Box minW={0} textAlign="left" flex={1}>
                  <Text
                    fontWeight="800"
                    fontSize="13.5px"
                    color="gray.800"
                    lineHeight="1.25"
                  >
                    {item.name}
                  </Text>
                  <HStack spacing={1.5} mt={0.5} wrap="wrap">
                    {colorInfo ? (
                      <HStack spacing={1}>
                        <Box w="6px" h="6px" borderRadius="full" bg={colorInfo.light} />
                        <Text fontSize="10.5px" fontWeight="700" color="teal.600">
                          {colorInfo.label}
                        </Text>
                      </HStack>
                    ) : (
                      <Text fontSize="10.5px" fontWeight="600" color="gray.400">
                        Default theme
                      </Text>
                    )}
                    {item.children && (
                      <Text fontSize="10.5px" color="gray.400">
                        • {item.children.length} sub-items
                      </Text>
                    )}
                  </HStack>
                </Box>
              </HStack>

              <HStack spacing={2} flexShrink={0} align="center">
                {colorInfo && (
                  <Box
                    w="16px"
                    h="16px"
                    borderRadius="full"
                    bg={colorInfo.light}
                    border="2px solid white"
                    boxShadow="0 0 0 1px rgba(0,0,0,0.15)"
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      bottom={0}
                      right={0}
                      w="100%"
                      h="100%"
                      bg={colorInfo.dark}
                      clipPath="polygon(100% 0, 100% 100%, 0 100%)"
                    />
                  </Box>
                )}
                <AccordionIcon color="gray.400" fontSize="18px" />
              </HStack>
            </Flex>
          </AccordionButton>
        </h2>

        <AccordionPanel px={2.5} pt={3} pb={4} bg="gray.50" borderTop="1px solid" borderColor="gray.150">
          <Box mb={item.children ? 4 : 0}>
            <Flex
              justify="space-between"
              align="center"
              mb={2.5}
              p={2}
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
            >
              <HStack spacing={2}>
                <Box w="8px" h="8px" borderRadius="full" bg={colorInfo ? colorInfo.light : "gray.400"} />
                <Text fontSize="11px" fontWeight="800" color="gray.700">
                  {colorInfo ? `${colorInfo.label} Theme` : "Default Theme"}
                </Text>
              </HStack>
              {colorInfo && (
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<DeleteIcon />}
                  onClick={() => handleResetColor(item.name)}
                  fontWeight="700"
                  fontSize="10.5px"
                  borderRadius="lg"
                  h="26px"
                >
                  Reset to Default
                </Button>
              )}
            </Flex>
            <ColorPickerComponent
              label={item.name}
              color={
                themeConfig.sidebarColors?.[item.name] || {
                  light: "#ffffff",
                  dark: "#1a202c",
                }
              }
              onChangeComplete={(color: { light: string; dark: string }) =>
                handleColorChange(item.name, color)
              }
            />
          </Box>

          {item.children && (
            <Box mt={3} pt={3} borderTop="1px dashed" borderColor="gray.200">
              <Text fontSize="11px" fontWeight="800" color="gray.600" textTransform="uppercase" letterSpacing="0.4px" mb={2}>
                Sub-navigation Items
              </Text>
              <Accordion allowToggle defaultIndex={[]}>
                {item.children.map((sub: any) => renderMobileAccordionItem(sub, true))}
              </Accordion>
            </Box>
          )}
        </AccordionPanel>
      </AccordionItem>
    );
  };

  // --- Desktop Sidebar Items Renderer (Original Desktop Layout) ---
  const traverseDesktopSidebarItems = (items: any[]) => {
    return items.map((item) => (
      <Box
        key={item.id}
        py={5}
        px={4}
        borderBottomWidth="1px"
        borderColor="gray.100"
        _hover={{ bg: "gray.50" }}
        transition="background 0.2s"
      >
        <Flex align="flex-start" justify="space-between" width="100%" gap={6}>
          <Box flex={1}>
            <Text fontWeight="600" fontSize="md" color="gray.700">
              {item.name}
            </Text>
            {item.children && (
              <Text fontSize="xs" color="gray.500" mt={1}>Sub-items available</Text>
            )}
            {themeConfig.sidebarColors?.[item.name] && (
              <Button
                variant="link"
                size="xs"
                colorScheme="red"
                leftIcon={<DeleteIcon />}
                onClick={() => handleResetColor(item.name)}
                mt={2}
                fontWeight="normal"
              >
                Reset to Default
              </Button>
            )}
          </Box>
          <Box w="320px">
            <ColorPickerComponent
              label={item.name}
              color={
                themeConfig.sidebarColors?.[item.name] || {
                  light: "#ffffff",
                  dark: "#1a202c",
                }
              }
              onChangeComplete={(color: { light: string; dark: string }) =>
                handleColorChange(item.name, color)
              }
            />
          </Box>
        </Flex>
        {item.children && (
          <Box pl={6} mt={4} borderLeftWidth="2px" borderColor="blue.100">
            <VStack align="stretch" spacing={0} width="100%">
              {traverseDesktopSidebarItems(item.children)}
            </VStack>
          </Box>
        )}
      </Box>
    ));
  };

  return (
    <>
      {/* MOBILE VIEW (Only for mobile apk UI perspective: < md) */}
      <Box display={{ base: "block", md: "none" }} w="100%" p={2}>
        <Box
          p={3.5}
          bgGradient="linear(135deg, #091E42 0%, #0C4A6E 60%, #0D9488 100%)"
          color="white"
          borderRadius="20px"
          mb={3.5}
          boxShadow="0 4px 15px rgba(12, 74, 110, 0.2)"
        >
          <HStack spacing={3} align="center">
            <Box p={2.5} bg="whiteAlpha.200" borderRadius="xl" backdropFilter="blur(4px)">
              <Icon as={FiLayers} fontSize="18px" color="teal.200" />
            </Box>
            <Box>
              <Heading size="xs" fontSize="13.5px" fontWeight="900" color="white">
                Sidebar Color Themes
              </Heading>
              <Text fontSize="11px" fontWeight="500" color="whiteAlpha.800" mt={0.5}>
                Tap any menu item below to personalize its icon and accent color.
              </Text>
            </Box>
          </HStack>
        </Box>

        <Accordion allowToggle defaultIndex={[0]}>
          {allSidebarItems.map((item) => renderMobileAccordionItem(item))}
        </Accordion>
      </Box>

      {/* DESKTOP VIEW (100% original desktop UI: >= md) */}
      <Box
        display={{ base: "none", md: "block" }}
        w="100%"
        p={4}
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="sm"
      >
        <Flex justify="space-between" align="center" mb={4} pb={4} borderBottomWidth="1px" borderColor="gray.100">
          <Box>
            <Heading size="md" color="gray.700">Sidebar Customization</Heading>
            <Text fontSize="sm" color="gray.500">
              Set custom background colors for sidebar items.
            </Text>
          </Box>
        </Flex>
        <VStack align="stretch" spacing={0}>
          {traverseDesktopSidebarItems(allSidebarItems)}
        </VStack>
      </Box>
    </>
  );
});

export default ProfileSettings;
