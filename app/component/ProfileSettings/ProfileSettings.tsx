import React from "react";
import { Box, Heading, VStack, Text, useColorModeValue, Flex, Button } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";
import { sidebarDatas, sidebarFooterData } from "../../layouts/dashboardLayout/SidebarLayout/utils/SidebarItems";
import ColorPickerComponent from "../common/ColorPicker/ColorPickerComponent";
import { DeleteIcon } from "@chakra-ui/icons";

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

  const traverseSidebarItems = (items: any[]) => {
    return items.map((item) => (
      <Box
        key={item.id}
        py={{ base: 3, md: 5 }}
        px={{ base: 3, md: 4 }}
        borderBottomWidth="1px"
        borderColor={useColorModeValue("gray.100", "gray.700")}
        _hover={{ bg: useColorModeValue("gray.50", "gray.800") }}
        transition="background 0.2s"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "flex-start" }}
          justify="space-between"
          width="100%"
          gap={{ base: 3, md: 6 }}
        >
          <Box flex={1} minW={0}>
            <Text fontWeight="700" fontSize={{ base: "sm", md: "md" }} color={useColorModeValue("gray.700", "white")}>
              {item.name}
            </Text>
            {item.children && (
              <Text fontSize="xs" color="gray.500" mt={0.5}>Sub-items available</Text>
            )}
            {themeConfig.sidebarColors?.[item.name] && (
              <Button
                variant="link"
                size="xs"
                colorScheme="red"
                leftIcon={<DeleteIcon />}
                onClick={() => handleResetColor(item.name)}
                mt={1}
                minH="36px"
                fontWeight="normal"
              >
                Reset to Default
              </Button>
            )}
          </Box>
          <Box w={{ base: "100%", md: "320px" }} maxW="100%">
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
          <Box pl={{ base: 3, md: 6 }} mt={{ base: 2, md: 4 }} borderLeftWidth="2px" borderColor={useColorModeValue("blue.100", "gray.600")}>
            <VStack align="stretch" spacing={0} width="100%">
              {traverseSidebarItems(item.children)}
            </VStack>
          </Box>
        )}
      </Box>
    ));
  };

  return (
    <Box w="100%" p={{ base: 3, md: 4 }} bg={useColorModeValue("white", "gray.800")} borderRadius={{ base: "lg", md: "xl" }} borderWidth="1px" borderColor={useColorModeValue("gray.200", "whiteAlpha.200")} shadow="sm">
      <Flex justify="space-between" align="center" mb={{ base: 2, md: 4 }} pb={{ base: 3, md: 4 }} borderBottomWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")}>
        <Box>
          <Heading size={{ base: "sm", md: "md" }} color={useColorModeValue("gray.800", "white")}>Sidebar customization</Heading>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Choose a color theme for each navigation item.
          </Text>
        </Box>
      </Flex>
      <VStack align="stretch" spacing={0}>
        {traverseSidebarItems(allSidebarItems)}
      </VStack>
    </Box>
  );
});

export default ProfileSettings;