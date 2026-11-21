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
  Badge,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";
import { sidebarDatas, sidebarFooterData } from "../../layouts/dashboardLayout/SidebarLayout/utils/SidebarItems";
import ColorPickerComponent, { COLOR_SUGGESTIONS } from "../common/ColorPicker/ColorPickerComponent";
import { DeleteIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { FiLayers, FiCheck } from "react-icons/fi";

const ProfileSettings = observer(() => {
  const {
    themeStore: {
      themeConfig,
      setModuleColor,
      resetModuleColor,
      activeModuleName,
    },
  } = stores;

  const currentPrimary = themeConfig.colors.custom.light.primary || "#0D9488";
  const currentDarkPrimary = themeConfig.colors.custom.dark.primary || "#0C4A6E";

  const allSidebarItems = [...sidebarDatas, ...sidebarFooterData];

  const handleColorChange = (name: string, newColor: { light: string; dark: string }) => {
    // setModuleColor already saves color + calls applyActiveModuleTheme internally.
    // We pass the CURRENT active module so we don't hijack navigation context.
    setModuleColor(name, newColor);
  };

  const handleResetColor = (name: string) => {
    resetModuleColor(name);
  };

  const getColorInfo = (name: string, parentName?: string) => {
    const customColor = themeConfig.sidebarColors?.[name];
    if (customColor) {
      const match = COLOR_SUGGESTIONS.find(
        (s) =>
          s.light.toLowerCase() === customColor.light?.toLowerCase() &&
          s.dark.toLowerCase() === customColor.dark?.toLowerCase()
      );
      return {
        label: match?.label ? `${match.label} Theme` : "Custom Theme",
        light: customColor.light,
        dark: customColor.dark,
        isInherited: false,
      };
    }

    if (parentName && themeConfig.sidebarColors?.[parentName]) {
      const parentColor = themeConfig.sidebarColors[parentName];
      const match = COLOR_SUGGESTIONS.find(
        (s) =>
          s.light.toLowerCase() === parentColor.light?.toLowerCase() &&
          s.dark.toLowerCase() === parentColor.dark?.toLowerCase()
      );
      return {
        label: match?.label ? `Inherited (${match.label})` : "Inherited Theme",
        light: parentColor.light,
        dark: parentColor.dark,
        isInherited: true,
      };
    }

    return null;
  };

  // --- Mobile Accordion Item Renderer ---
  const renderMobileAccordionItem = (item: any, parentName?: string) => {
    const colorInfo = getColorInfo(item.name, parentName);
    const isCurrentActive = activeModuleName === item.name;

    return (
      <AccordionItem
        key={item.id}
        border={isCurrentActive ? "2px solid" : "1px solid"}
        borderColor={isCurrentActive ? (colorInfo?.light || currentPrimary) : "gray.200"}
        borderRadius="16px"
        mb={2.5}
        overflow="hidden"
        bg="white"
        shadow={isCurrentActive ? "sm" : "xs"}
      >
        <h2>
          <AccordionButton
            px={3}
            py={2.5}
            _hover={{ bg: "gray.50" }}
            _expanded={{ bg: "gray.100" }}
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
                  <HStack spacing={2}>
                    <Text
                      fontWeight="800"
                      fontSize="13.5px"
                      color="gray.800"
                      lineHeight="1.25"
                    >
                      {item.name}
                    </Text>
                    {isCurrentActive && (
                      <Badge
                        bg={colorInfo?.light || currentPrimary}
                        color="white"
                        fontSize="9px"
                        fontWeight="800"
                        borderRadius="full"
                        px={2}
                        py={0.5}
                      >
                        Active Now
                      </Badge>
                    )}
                  </HStack>
                  <HStack spacing={1.5} mt={0.5} wrap="wrap">
                    {colorInfo ? (
                      <HStack spacing={1}>
                        <Box w="6px" h="6px" borderRadius="full" bg={colorInfo.light} />
                        <Text fontSize="10.5px" fontWeight="700" color={colorInfo.light}>
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
                  {colorInfo ? colorInfo.label : "Default Theme"}
                </Text>
              </HStack>
              {colorInfo && !colorInfo.isInherited && (
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
              color={themeConfig.sidebarColors?.[item.name] || null}
              onChangeComplete={(color: { light: string; dark: string }) =>
                handleColorChange(item.name, color)
              }
            />
          </Box>

          {item.children && (
            <Box mt={3} pt={3} borderTop="1px dashed" borderColor="gray.200">
              <Text fontSize="11px" fontWeight="800" color="gray.600" textTransform="uppercase" letterSpacing="0.4px" mb={2}>
                Sub-navigation Items (Inherit parent theme unless customized)
              </Text>
              <Accordion allowToggle defaultIndex={[]}>
                {item.children.map((sub: any) => renderMobileAccordionItem(sub, item.name))}
              </Accordion>
            </Box>
          )}
        </AccordionPanel>
      </AccordionItem>
    );
  };

  // --- Desktop Sidebar Items Renderer ---
  const traverseDesktopSidebarItems = (items: any[], parentName?: string) => {
    return items.map((item) => {
      const colorInfo = getColorInfo(item.name, parentName);
      const isCurrentActive = activeModuleName === item.name;

      return (
        <Box
          key={item.id}
          py={4}
          px={4}
          borderBottomWidth="1px"
          borderColor="gray.100"
          _hover={{ bg: "gray.50" }}
          transition="background 0.2s"
          bg={isCurrentActive ? `${colorInfo?.light || currentPrimary}10` : "transparent"}
          borderRadius="lg"
        >
          <Flex align="flex-start" justify="space-between" width="100%" gap={6}>
            <Box flex={1}>
              <HStack spacing={2.5} align="center">
                {item.icon && (
                  <Box
                    p={1.5}
                    borderRadius="md"
                    bg={colorInfo ? colorInfo.light : "gray.100"}
                    color={colorInfo ? "white" : "gray.600"}
                    fontSize="13px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow={colorInfo ? "0 2px 6px rgba(0,0,0,0.12)" : "none"}
                  >
                    {React.isValidElement(item.icon) ? item.icon : <Icon as={item.icon} />}
                  </Box>
                )}
                <Text fontWeight="700" fontSize="md" color="gray.800">
                  {item.name}
                </Text>
                {isCurrentActive && (
                  <Badge
                    bg={colorInfo?.light || currentPrimary}
                    color="white"
                    fontSize="xs"
                    fontWeight="800"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                  >
                    Active Now
                  </Badge>
                )}
              </HStack>

              <HStack spacing={2} mt={1.5} align="center">
                {colorInfo ? (
                  <HStack spacing={1.5}>
                    <Box w="8px" h="8px" borderRadius="full" bg={colorInfo.light} />
                    <Text fontSize="xs" fontWeight="700" color={colorInfo.light}>
                      {colorInfo.label}
                    </Text>
                  </HStack>
                ) : (
                  <Text fontSize="xs" color="gray.400" fontWeight="500">
                    Default system theme
                  </Text>
                )}
                {item.children && (
                  <Text fontSize="xs" color="gray.400">
                    • {item.children.length} sub-items
                  </Text>
                )}
              </HStack>

              {colorInfo && !colorInfo.isInherited && (
                <Button
                  variant="link"
                  size="xs"
                  colorScheme="red"
                  leftIcon={<DeleteIcon />}
                  onClick={() => handleResetColor(item.name)}
                  mt={2.5}
                  fontWeight="600"
                >
                  Reset to Default
                </Button>
              )}
            </Box>

            <Box w="320px">
              <ColorPickerComponent
                label={item.name}
                color={themeConfig.sidebarColors?.[item.name] || null}
                onChangeComplete={(color: { light: string; dark: string }) =>
                  handleColorChange(item.name, color)
                }
              />
            </Box>
          </Flex>

          {item.children && (
            <Box pl={6} mt={3} borderLeftWidth="3px" borderColor="teal.100">
              <Text fontSize="11px" fontWeight="700" color="gray.500" mb={2} textTransform="uppercase" letterSpacing="0.5px">
                Sub-items (Inherit {item.name}&apos;s theme unless overridden)
              </Text>
              <VStack align="stretch" spacing={1} width="100%">
                {traverseDesktopSidebarItems(item.children, item.name)}
              </VStack>
            </Box>
          )}
        </Box>
      );
    });
  };

  return (
    <>
      {/* MOBILE VIEW (Only for mobile apk UI perspective: < md) */}
      <Box display={{ base: "block", md: "none" }} w="100%" p={2}>
        <Box
          p={3.5}
          bgGradient={`linear(135deg, #091E42 0%, ${currentDarkPrimary} 45%, ${currentPrimary} 100%)`}
          color="white"
          borderRadius="20px"
          mb={3.5}
          boxShadow={`0 4px 15px ${currentDarkPrimary}33`}
        >
          <HStack spacing={3} align="center">
            <Box p={2.5} bg="whiteAlpha.200" borderRadius="xl" backdropFilter="blur(4px)">
              <Icon as={FiLayers} fontSize="18px" color="white" />
            </Box>
            <Box>
              <Heading size="xs" fontSize="13.5px" fontWeight="900" color="white">
                Module Color Themes
              </Heading>
              <Text fontSize="11px" fontWeight="500" color="whiteAlpha.800" mt={0.5}>
                Tap any module below to personalize its theme separately. The whole app theme dynamically changes when that module is selected.
              </Text>
            </Box>
          </HStack>
        </Box>

        <Accordion allowToggle defaultIndex={[0]}>
          {allSidebarItems.map((item) => renderMobileAccordionItem(item))}
        </Accordion>
      </Box>

      {/* DESKTOP VIEW (>= md) */}
      <Box
        display={{ base: "none", md: "block" }}
        w="100%"
        p={5}
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        shadow="sm"
      >
        <Box
          p={4}
          mb={5}
          borderRadius="xl"
          bgGradient={`linear(135deg, #091E42 0%, ${currentDarkPrimary} 45%, ${currentPrimary} 100%)`}
          color="white"
          boxShadow={`0 4px 15px ${currentDarkPrimary}33`}
        >
          <Flex justify="space-between" align="center">
            <HStack spacing={3.5}>
              <Box p={2.5} bg="whiteAlpha.200" borderRadius="lg" backdropFilter="blur(4px)">
                <Icon as={FiLayers} fontSize="20px" color="white" />
              </Box>
              <Box>
                <Heading size="sm" color="white" fontWeight="800">
                  Module Themes &amp; Customization
                </Heading>
                <Text fontSize="xs" color="whiteAlpha.800" mt={0.5}>
                  Set a distinct theme for each module separately. When you select or navigate to any module, the entire application theme (header, buttons, navigation, and accents) automatically adapts to that module&apos;s theme.
                </Text>
              </Box>
            </HStack>
            {activeModuleName && (
              <Badge
                bg="whiteAlpha.300"
                color="white"
                px={3}
                py={1.5}
                borderRadius="lg"
                fontSize="xs"
                fontWeight="700"
                backdropFilter="blur(4px)"
              >
                Current Module: {activeModuleName}
              </Badge>
            )}
          </Flex>
        </Box>

        <VStack align="stretch" spacing={1}>
          {traverseDesktopSidebarItems(allSidebarItems)}
        </VStack>
      </Box>
    </>
  );
});

export default ProfileSettings;
