"use client";
import React, { useState, useCallback } from "react";
import { Box, Heading, Flex, Button, Text, useColorModeValue, HStack, IconButton, Icon, VStack, Badge } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import WaitingRoomWhatsApp from "./component/WaitingRoomWhatsApp";
import moment from "moment";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, RepeatIcon } from "@chakra-ui/icons";
import { MdOutlineAirlineSeatReclineExtra } from "react-icons/md";
import stores from "../../../store/stores";

const WaitingRoomPage = observer((): any => {
    const {
        auth: { userType },
    } = stores;

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const goToPreviousDate = () => {
        setSelectedDate((prev: any) => moment(prev).subtract(1, "day").toDate());
    };

    const goToNextDate = () => {
        setSelectedDate((prev: any) => moment(prev).add(1, "day").toDate());
    };

    const bgColor = useColorModeValue("gray.50", "#0a0a0b");
    const containerBg = useColorModeValue("whiteAlpha.900", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const todayBtnBg = useColorModeValue("blue.50", "whiteAlpha.100");
    const datePillBg = useColorModeValue("gray.50", "blackAlpha.400");

    const resetToToday = () => {
        setSelectedDate(new Date());
    };

    return (
        <Box p={{ base: 4, xl: 8 }} bg={bgColor} maxH="80vh">
            {/* Elite Command Header */}
            <Flex
                direction={{ base: "column", lg: "row" }}
                align={{ base: "stretch", lg: "center" }}
                justify="space-between"
                mb={10}
                bg={containerBg}
                backdropFilter="blur(20px)"
                p={7}
                borderRadius="3xl"
                boxShadow={useColorModeValue("0 20px 40px -15px rgba(0,0,0,0.05)", "0 30px 60px -20px rgba(0,0,0,0.5)")}
                border="1px solid"
                borderColor={borderColor}
                gap={6}
            >
                <HStack spacing={6}>
                    <Box
                        p={4}
                        bgGradient="linear(to-br, blue.400, teal.400)"
                        borderRadius="2xl"
                        color="white"
                        boxShadow="0 15px 35px -10px rgba(49, 130, 206, 0.6)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <MdOutlineAirlineSeatReclineExtra size={32} />
                    </Box>
                    <VStack align="start" spacing={1}>
                        <HStack spacing={4}>
                            <Heading size="lg" fontWeight="900" letterSpacing="-0.04em">Waiting Room</Heading>
                            <Badge
                                variant="outline"
                                colorScheme="green"
                                borderRadius="full"
                                px={3}
                                py={0.5}
                                border="1px solid"
                                borderColor="green.500"
                                fontSize="10px"
                                fontWeight="900"
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                            >
                                <Box boxSize={1.5} bg="green.500" borderRadius="full" animation="pulse 1.5s infinite" />
                                LIVE QUEUE
                            </Badge>
                        </HStack>
                        <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="0.05em">
                            MANAGE PATIENT WORKFLOW WITH PRECISION
                        </Text>
                    </VStack>
                </HStack>

                <Flex align="center" gap={4} wrap="wrap" display="none">
                    <Button
                        size="md"
                        leftIcon={<RepeatIcon />}
                        onClick={resetToToday}
                        variant="subtle"
                        colorScheme="blue"
                        bg={todayBtnBg}
                        borderRadius="2xl"
                        fontWeight="900"
                        fontSize="xs"
                        px={6}
                        height="48px"
                        _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                    >
                        TODAY
                    </Button>

                    <HStack
                        bg={datePillBg}
                        p={1.5}
                        borderRadius="2xl"
                        spacing={0}
                        border="1px solid"
                        borderColor={borderColor}
                        boxShadow="inner"
                    >
                        <IconButton
                            aria-label="Previous day"
                            icon={<ChevronLeftIcon fontSize="24px" />}
                            onClick={goToPreviousDate}
                            variant="ghost"
                            size="md"
                            borderRadius="xl"
                        />

                        <HStack px={8} spacing={4}>
                            <Icon as={CalendarIcon} color="blue.500" boxSize={4} />
                            <Text fontWeight="900" fontSize="md" color={useColorModeValue("gray.800", "white")} letterSpacing="-0.02em">
                                {moment(selectedDate).format("dddd, DD MMM YYYY")}
                            </Text>
                        </HStack>

                        <IconButton
                            aria-label="Next day"
                            icon={<ChevronRightIcon fontSize="24px" />}
                            onClick={goToNextDate}
                            variant="ghost"
                            size="md"
                            borderRadius="xl"
                        />
                    </HStack>
                </Flex>
            </Flex>

            <Box bg={useColorModeValue("white", "gray.800")} borderRadius="xl" boxShadow="md" p={2}>
                <WaitingRoomWhatsApp
                    selectedDate={selectedDate}
                />
            </Box>
        </Box>
    );
});

export default WaitingRoomPage;
