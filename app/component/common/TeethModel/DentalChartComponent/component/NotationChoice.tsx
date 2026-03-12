import {
    Box,
    Button,
    Heading,
    Text,
    VStack,
    HStack,
    useColorModeValue,
    Circle,
    Icon,
    SimpleGrid,
} from "@chakra-ui/react";
import { FiArrowLeft, FiHash, FiGrid, FiLayout, FiChevronRight } from "react-icons/fi";

interface NotationChoiceProps {
    onSelect: (notation: "fdi" | "universal" | "palmer") => void;
    onBack: () => void;
}

export const NotationChoice = ({ onSelect, onBack }: NotationChoiceProps) => {
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.100", "gray.700");

    const systems = [
        {
            id: "fdi",
            label: "FDI WORLD",
            sub: "ISO 3950 Standard",
            icon: FiGrid,
            desc: "Global 2-digit quadrant system (e.g. 11, 21).",
            example: "11-48 Series"
        },
        {
            id: "universal",
            label: "UNIVERSAL",
            sub: "US Sequential",
            icon: FiHash,
            desc: "Sequential numbering from 1 to 32.",
            example: "1-32 Series"
        },
        {
            id: "palmer",
            label: "PALMER",
            sub: "Symbolic Grid",
            icon: FiLayout,
            desc: "Graphical quadrants using symbolic notation.",
            example: "L-Grid Mapping"
        },
    ];

    return (
        <Box py={8} maxW="5xl" mx="auto" px={6}>
            <VStack spacing={10}>
                {/* Compact Header with Navigation */}
                <VStack spacing={3} textAlign="center">
                    <HStack spacing={4} justify="center">
                        <Button
                            variant="link"
                            size="xs"
                            onClick={onBack}
                            leftIcon={<FiArrowLeft />}
                            color="gray.400"
                            fontWeight="900"
                            _hover={{ color: "blue.500", textDecoration: "none" }}
                            textTransform="uppercase"
                            letterSpacing="widest"
                            fontSize="10px"
                        >
                            Back
                        </Button>
                        <Box w="1px" h="10px" bg="gray.100" />
                        <Text color="gray.300" fontSize="11px" fontWeight="900" letterSpacing="0.4em" textTransform="uppercase">
                            Narrative
                        </Text>
                    </HStack>
                    <Heading size="lg" fontWeight="900" color="gray.800" letterSpacing="tight">
                        Charting Convention
                    </Heading>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} w="full">
                    {systems.map((not) => (
                        <Box
                            key={not.id}
                            as="button"
                            onClick={() => onSelect(not.id as any)}
                            p={6}
                            bg="rgba(255, 255, 255, 0.7)"
                            backdropFilter="blur(10px)"
                            border="1px solid"
                            borderColor="gray.100"
                            borderRadius="2xl"
                            transition="all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)"
                            textAlign="left"
                            role="group"
                            boxShadow="sm"
                            _hover={{
                                borderColor: "blue.100",
                                transform: "translateY(-4px)",
                                boxShadow: "2xl",
                                bg: "rgba(255, 255, 255, 0.9)"
                            }}
                            _active={{ transform: "scale(0.98)" }}
                            position="relative"
                            overflow="hidden"
                        >
                            {/* Dual Side Accents */}
                            <Box
                                position="absolute"
                                top="6"
                                left="0"
                                bottom="6"
                                w="3px"
                                bg="blue.500"
                                borderRadius="full"
                                opacity={0.2}
                                _groupHover={{ opacity: 1, backgroundColor: "blue.600" }}
                                transition="all 0.3s"
                            />
                            <Box
                                position="absolute"
                                top="6"
                                right="0"
                                bottom="6"
                                w="3px"
                                bg="blue.500"
                                borderRadius="full"
                                opacity={0.2}
                                _groupHover={{ opacity: 1, backgroundColor: "blue.600" }}
                                transition="all 0.3s"
                            />

                            <VStack spacing={5} align="start">
                                <HStack w="full" justify="space-between">
                                    <Text fontSize="10px" fontWeight="900" color="blue.500" letterSpacing="0.2em">
                                        SYSTEM 0{systems.indexOf(not) + 1}
                                    </Text>
                                    <Circle size="34px" bg="blue.50" color="blue.500" transition="all 0.3s" _groupHover={{ bg: "blue.500", color: "white" }}>
                                        <Icon as={not.icon} boxSize={4} />
                                    </Circle>
                                </HStack>

                                <VStack spacing={1} align="start">
                                    <Heading fontSize="sm" fontWeight="900" color="gray.800" letterSpacing="tight">
                                        {not.label}
                                    </Heading>
                                    <Text fontSize="10px" fontWeight="900" color="blue.400" letterSpacing="0.2em">
                                        {not.sub}
                                    </Text>
                                </VStack>

                                <Text fontSize="12px" color="gray.500" fontWeight="600" lineHeight="1.4">
                                    {not.desc}
                                </Text>

                                <Box w="full" pt={3} borderTop="1px solid" borderColor="gray.100">
                                    <HStack justify="space-between">
                                        <Text fontSize="10px" fontWeight="900" color="gray.400" letterSpacing="0.05em">
                                            {not.example}
                                        </Text>
                                        <Icon as={FiChevronRight} boxSize={3} color="blue.500" opacity={0.4} _groupHover={{ opacity: 1, transform: "translateX(4px)" }} transition="all 0.3s" />
                                    </HStack>
                                </Box>
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>
            </VStack>
        </Box>
    );
};
