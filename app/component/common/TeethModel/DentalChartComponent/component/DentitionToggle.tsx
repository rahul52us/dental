import {
  HStack,
  Tab,
  TabList,
  Tabs,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiUser } from "react-icons/fi";
import { LuBaby } from "react-icons/lu";
import { DentitionType } from "../utils/teethData";

interface DentitionToggleProps {
  value: DentitionType;
  onChange: (value: DentitionType) => void;
}

const TAB_INDEX: Record<DentitionType, number> = {
  adult: 0,
  child: 1,
};

const TAB_VALUE: Record<number, DentitionType> = {
  0: "adult",
  1: "child",
};

export const DentitionToggle = ({
  value,
  onChange,
}: DentitionToggleProps) => {
  const containerBg = useColorModeValue("gray.100", "darkBrand.100");
  const inactiveColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Tabs
      isFitted
      w="full"
      index={TAB_INDEX[value]}
      onChange={(index) => onChange(TAB_VALUE[index])}
      variant="unstyled"
    >
      <TabList
        bg={containerBg}
        p="3px"
        rounded="xl"
        gap={1}
        w="full"
      >
        <Tab
          flex={1}
          px={{ base: 1.5, sm: 3 }}
          py={1.5}
          rounded="lg"
          transition="all 0.2s"
          color={inactiveColor}
          _selected={{
            bg: "blue.500",
            color: "white",
            boxShadow: "sm",
          }}
          _hover={{
            color: useColorModeValue("gray.800", "white"),
          }}
        >
          <HStack spacing={1} justify="center">
            <FiUser size={13} />
            <Text fontSize={{ base: "10px", sm: "11px" }} fontWeight="bold" color="inherit" whiteSpace="nowrap">
              Adult (32 Teeth)
            </Text>
          </HStack>
        </Tab>

        <Tab
          flex={1}
          px={{ base: 1.5, sm: 3 }}
          py={1.5}
          rounded="lg"
          transition="all 0.2s"
          color={inactiveColor}
          _selected={{
            bg: "blue.500",
            color: "white",
            boxShadow: "sm",
          }}
          _hover={{
            color: useColorModeValue("gray.800", "white"),
          }}
        >
          <HStack spacing={1} justify="center">
            <LuBaby size={13} />
            <Text fontSize={{ base: "10px", sm: "11px" }} fontWeight="bold" color="inherit" whiteSpace="nowrap">
              Child (20 Teeth)
            </Text>
          </HStack>
        </Tab>
      </TabList>
    </Tabs>
  );
};
