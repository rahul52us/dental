import {
    Box,
    Flex,
    Heading,
    Icon,
    Text,
    VStack,
    HStack,
    useColorModeValue,
    Circle,
} from "@chakra-ui/react";
import { FaTooth, FaEdit, FaNotesMedical } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

interface ComplaintSelectionModeProps {
    onSelect: (mode: "teeth" | "description" | "notes") => void;
}

export const ComplaintSelectionMode = ({ onSelect }: ComplaintSelectionModeProps) => {
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.100", "gray.700");

    const modes = [
        {
            id: "teeth",
            title: "DENTITION MAP",
            desc: "Interactive tooth-by-tooth diagnostic charting.",
            icon: FaTooth,
            color: "blue.500",
            tag: "PROTOCOL A"
        },
        {
            id: "description",
            title: "CLINICAL NARRATIVE",
            desc: "Detailed text-based clinical observation entry.",
            icon: FaEdit,
            color: "blue.600",
            tag: "PROTOCOL B"
        },
        {
            id: "notes",
            title: "RAPID OBSERVATION",
            desc: "Quick recording of general clinical findings.",
            icon: FaNotesMedical,
            color: "blue.700",
            tag: "PROTOCOL C"
        }
    ];

    return (
        <Box py={8} maxW="4xl" mx="auto" px={6}>
            <VStack spacing={10}>
                {/* Compact Centered Header */}
                <VStack spacing={3} textAlign="center">
                    <Text color="blue.500" fontSize="11px" fontWeight="900" letterSpacing="0.4em" textTransform="uppercase">
                        Diagnostic Entry Protocol
                    </Text>
                    <Heading size="lg" fontWeight="900" color="gray.800" letterSpacing="tight">
                        Select Diagnostic Pathway
                    </Heading>
                </VStack>

                <Flex gap={4} wrap="wrap" justify="center" w="full">
                    {modes.map((mode) => (
                        <Box
                            key={mode.id}
                            as="button"
                            onClick={() => onSelect(mode.id as any)}
                            flex="1"
                            minW="240px"
                            maxW="260px"
                            p={6}
                            bg="rgba(255, 255, 255, 0.7)"
                            backdropFilter="blur(10px)"
                            border="1px solid"
                            borderColor="gray.100"
                            borderRadius="2xl"
                            textAlign="left"
                            transition="all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)"
                            boxShadow="sm"
                            _hover={{
                                transform: "translateY(-4px)",
                                boxShadow: "xl",
                                borderColor: "blue.100",
                                bg: "rgba(255, 255, 255, 0.9)"
                            }}
                            _active={{ transform: "scale(0.98)" }}
                            role="group"
                            position="relative"
                            overflow="hidden"
                        >
                            {/* Dual Side Accents */}
                            <Box
                                position="absolute"
                                top="4"
                                left="0"
                                bottom="4"
                                w="3px"
                                bg="blue.500"
                                borderRadius="full"
                                opacity={0.2}
                                _groupHover={{ opacity: 1, backgroundColor: "blue.600" }}
                                transition="all 0.3s"
                            />
                            <Box
                                position="absolute"
                                top="4"
                                right="0"
                                bottom="4"
                                w="3px"
                                bg="blue.500"
                                borderRadius="full"
                                opacity={0.2}
                                _groupHover={{ opacity: 1, backgroundColor: "blue.600" }}
                                transition="all 0.3s"
                            />

                            <VStack align="start" spacing={4} h="full">
                                <HStack w="full" justify="space-between">
                                    <Text fontSize="10px" fontWeight="900" color="blue.500" letterSpacing="0.2em">
                                        {mode.tag}
                                    </Text>
                                    <Circle size="34px" bg="blue.50" color="blue.500" transition="all 0.3s" _groupHover={{ bg: "blue.500", color: "white", transform: "rotate(-10deg)" }}>
                                        <Icon as={mode.icon} boxSize={4} />
                                    </Circle>
                                </HStack>

                                <VStack align="start" spacing={1.5}>
                                    <Heading fontSize="sm" fontWeight="900" color="gray.800" letterSpacing="tight">
                                        {mode.title}
                                    </Heading>
                                    <Text fontSize="12px" color="gray.500" fontWeight="600" lineHeight="1.4">
                                        {mode.desc}
                                    </Text>
                                </VStack>

                                <HStack
                                    spacing={2}
                                    color="blue.500"
                                    pt={1}
                                    opacity={0.4}
                                    _groupHover={{ opacity: 1, transform: "translateX(4px)" }}
                                    transition="all 0.3s"
                                >
                                    <Text fontSize="10px" fontWeight="900" letterSpacing="0.2em">INITIALIZE PATHWAY</Text>
                                    <Icon as={FiChevronRight} boxSize={3} />
                                </HStack>
                            </VStack>
                        </Box>
                    ))}
                </Flex>
            </VStack>
        </Box>
    );
};
