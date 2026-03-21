import {
    Box,
    Button,
    Heading,
    Text,
    VStack,
    Textarea,
    HStack,
    Circle,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiArrowLeft, FiEdit3, FiChevronRight } from "react-icons/fi";

interface DescriptionEntryProps {
    onNext?: (description: string) => void;
    onBack?: () => void;
    value?: string;
    onChange?: (e: any) => void;
    hideButtons?: boolean;
}

export const DescriptionEntry = ({ onNext, onBack, value, onChange, hideButtons }: DescriptionEntryProps) => {
    const [localDescription, setLocalDescription] = useState("");
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.100", "gray.700");

    const descriptionValue = value !== undefined ? value : localDescription;
    const handleDescriptionChange = onChange || ((e: any) => setLocalDescription(e.target.value));

    return (
        <Box py={hideButtons ? 0 : 12} maxW={hideButtons ? "full" : "xl"} mx="auto">
            <VStack spacing={8} align="stretch">
                {/* Compact Clinical Header */}
                {!hideButtons && (
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
                            >
                                Back
                            </Button>
                            <Box w="1px" h="10px" bg="gray.100" />
                            <Text color="gray.300" fontSize="9px" fontWeight="900" letterSpacing="0.4em" textTransform="uppercase">
                                Narrative
                            </Text>
                        </HStack>
                        <Heading size="lg" fontWeight="900" color="gray.800" letterSpacing="tight">
                            Entry of Observations
                        </Heading>
                    </VStack>
                )}

                <Box
                    p={hideButtons ? 0 : 8}
                    bg={hideButtons ? "transparent" : "white"}
                    borderRadius="3xl"
                    border={hideButtons ? "none" : "1px solid"}
                    borderColor="gray.100"
                    boxShadow={hideButtons ? "none" : "sm"}
                >
                    <VStack spacing={8} align="stretch">
                        <VStack align="start" spacing={2}>
                            <HStack spacing={2}>
                                <Circle size="4px" bg="blue.500" />
                                <Text fontSize="9px" fontWeight="900" color="gray.400" letterSpacing="0.2em" textTransform="uppercase">
                                    Findings Summary
                                </Text>
                            </HStack>
                            <Textarea
                                placeholder="Enter clinical details..."
                                height={hideButtons ? "100px" : "180px"}
                                value={descriptionValue}
                                onChange={handleDescriptionChange}
                                fontSize="sm"
                                fontWeight="600"
                                borderRadius="2xl"
                                border="1px solid"
                                borderColor="gray.100"
                                bg="gray.50"
                                _focus={{
                                    borderColor: "blue.200",
                                    bg: "white",
                                    boxShadow: "none"
                                }}
                                p={hideButtons ? 4 : 6}
                                transition="all 0.4s"
                                color="gray.700"
                            />
                        </VStack>

                        {!hideButtons && (
                            <VStack spacing={4}>
                                <Button
                                    colorScheme="blue"
                                    w="full"
                                    h="54px"
                                    borderRadius="2xl"
                                    isDisabled={!descriptionValue.trim()}
                                    onClick={() => onNext?.(descriptionValue)}
                                    fontSize="xs"
                                    fontWeight="900"
                                    textTransform="uppercase"
                                    letterSpacing="0.1em"
                                    rightIcon={<FiChevronRight />}
                                    boxShadow="0 10px 20px rgba(49, 130, 206, 0.1)"
                                    _hover={{
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 15px 30px rgba(49, 130, 206, 0.15)"
                                    }}
                                >
                                    Finalize Entry
                                </Button>
                                <Text fontSize="9px" color="gray.300" fontWeight="800" textTransform="uppercase" letterSpacing="0.1em">
                                    Proceeding to protocol assignment
                                </Text>
                            </VStack>
                        )}
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};
