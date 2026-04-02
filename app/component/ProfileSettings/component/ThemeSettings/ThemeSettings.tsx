"use client";

import { observer } from "mobx-react-lite";
import { Box, Button, Flex, Grid, SystemStyleObject, Text } from "@chakra-ui/react";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import stores from "../../../../store/stores";
import ColorPickerComponent from "../../../common/ColorPicker/ColorPicker";

interface ColorOption {
  name: string;
  code: string;
}

interface CustomColorBoxProps {
  color: string;
  colorName: string;
  selected: boolean;
  onClick: () => void;
}

const CustomColorBox: React.FC<CustomColorBoxProps> = ({ color, colorName, selected, onClick }) => {
  const boxStyle: SystemStyleObject = {
    width: "70px",
    height: "70px",
    backgroundColor: color,
    borderRadius: "50%",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: selected ? "2px solid black" : "1px solid lightgray",
  };

  return (
    <Box display="flex" flexDir="column" alignItems="center">
      <Box sx={boxStyle} onClick={onClick}>
        {selected && <FaCheck color="white" />}
      </Box>
      <Text mt={2} fontSize="sm" fontWeight="bold">
        {colorName}
      </Text>
    </Box>
  );
};

const ThemeSettings: React.FC = observer(() => {
  const {
    themeStore: { resetTheme, setThemeConfig, themeConfig },
  } = stores;

  const colors: ColorOption[] = [
    { name: "Blue", code: "#63B3ED" },
    { name: "Green", code: "#19a974" },
    { name: "Yellow", code: "#d6a407" },
    { name: "Red", code: "#ff6b6b" },
    { name: "Purple", code: "#6b37ff" },
    { name: "Orange", code: "#ffaa00" },
  ];

  const selectedColor = themeConfig.colors.custom.light.primary;

  const handleColorSelect = (color: ColorOption) => {
    setThemeConfig("colors.custom.light.primary", color.code);
  };

  return (
    <Flex flexDir="column" p={4}>
      <Box bgColor="#E5F6FD" borderRadius={5} p={3} mb={5} fontSize="md">
        <Text color="#014361" fontSize="sm">
          {`Welcome! Explore our style options below and select the ones that perfectly match your preferences.`}
        </Text>
      </Box>
      
      <Box mb={6}>
        <Text fontWeight="bold" mb={3}>Custom Color Picker</Text>
        <ColorPickerComponent />
      </Box>

      <Box>
        <Text fontWeight="bold" mb={4}>Preset Themes</Text>
        <Grid gridTemplateColumns="repeat(auto-fill, minmax(80px, 1fr))" gap={6}>
          {colors.map((color) => (
            <CustomColorBox
              key={color.code}
              color={color.code}
              colorName={color.name}
              selected={selectedColor === color.code}
              onClick={() => handleColorSelect(color)}
            />
          ))}
        </Grid>
      </Box>

      <Button mt={10} colorScheme="red" variant="outline" onClick={resetTheme} w="fit-content" alignSelf="center">
        Reset to Default Theme
      </Button>
    </Flex>
  );
});

export default ThemeSettings;
