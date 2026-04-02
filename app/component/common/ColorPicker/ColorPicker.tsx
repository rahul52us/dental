'use client';
import { useState } from "react";
import { ChromePicker, ColorResult } from "react-color";
import { Button, useDisclosure, Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import theme from "../../../theme/theme";

const ColorPickerComponent = observer(() => {
  const {
    themeStore: { setThemeConfig, themeConfig },
  } = stores;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleColorChange = (newColor: ColorResult) => {
    setThemeConfig("colors.custom.light.primary", newColor.hex);
  };

  const pickerStyles = {
    default: {
      picker: {
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
        borderRadius: "10px",
        background: "#fff",
        border: "1px solid #ccc",
        zIndex: "999",
      },
    },
  };

  return (
    <>
      <Button
        onClick={isOpen ? onClose : onOpen}
        bg={themeConfig.colors.custom.light.primary}
        color="white"
        _hover={{ opacity: 0.8 }}
        size="sm"
        fontWeight="bold"
        boxShadow="sm"
        leftIcon={<Box w="12px" h="12px" borderRadius="full" border="1px solid white" bg={themeConfig.colors.custom.light.primary} />}
      >
        Custom Color
      </Button>
      {isOpen && (
        <Box position="absolute" zIndex={999}>
          <ChromePicker
            color={themeConfig.colors.custom.light.primary}
            onChange={handleColorChange}
            disableAlpha
            styles={pickerStyles}
          />
        </Box>
      )}
    </>
  );
});

export default ColorPickerComponent;
