"use client";
import React, { useState, useCallback } from "react";
import { Box, Heading, Flex, Button, Text, useColorModeValue, HStack, IconButton, Icon, VStack, Badge } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import WaitingRoomWhatsApp from "./component/WaitingRoomWhatsApp";
import moment from "moment";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, RepeatIcon } from "@chakra-ui/icons";
import { MdOutlineAirlineSeatReclineExtra } from "react-icons/md";
import stores from "../../../store/stores";
import { useTranslation } from "react-i18next";

const WaitingRoomPage = observer((): any => {
    const {
        auth: { userType },
    } = stores;

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const ads = stores.advertisementStore.activeAdvertisements?.data || [];

    React.useEffect(() => {
        stores.advertisementStore.getActiveAdvertisements();
    }, []);

    React.useEffect(() => {
        if (ads.length > 1) {
            const interval = setInterval(() => {
                setCurrentAdIndex((prev) => (prev + 1) % ads.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [ads.length]);

    const goToPreviousDate = () => {
        setSelectedDate((prev: any) => moment(prev).subtract(1, "day").toDate());
    };

    const goToNextDate = () => {
        setSelectedDate((prev: any) => moment(prev).add(1, "day").toDate());
    };
    const { t } = useTranslation();

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
                            <Heading size="lg" fontWeight="900" letterSpacing="-0.04em">{t("waitingRoom.title")}</Heading>
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
                                {t("waitingRoom.liveQueue")}
                            </Badge>
                        </HStack>
                        <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="0.05em">
                            {t("waitingRoom.subtitle")}
                        </Text>
                    </VStack>
                </HStack>

                <Box
                    w={{ base: "100%", lg: "400px", xl: "500px" }}
                    h={{ base: "80px", md: "100px" }}
                    borderRadius="xl"
                    overflow="hidden"
                    position="relative"
                    boxShadow="inset 0 0 20px rgba(0,0,0,0.05)"
                    bg={useColorModeValue("gray.50", "whiteAlpha.100")}
                    border="1px solid"
                    borderColor={borderColor}
                >
                    <style>
                        {`
                          @keyframes adMarquee {
                            0% { transform: translateX(100%); }
                            100% { transform: translateX(-100%); }
                          }
                        `}
                    </style>
                    {ads.length > 0 ? (
                        <Box position="relative" w="100%" h="100%" borderRadius="xl" overflow="hidden">
                            <Box
                                as="img"
                                src={ads[currentAdIndex]?.image?.url}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                                transition="opacity 0.5s ease-in-out"
                                cursor={ads[currentAdIndex]?.link ? "pointer" : "default"}
                                onClick={() => {
                                    if (ads[currentAdIndex]?.link) {
                                        window.open(ads[currentAdIndex].link, "_blank");
                                    }
                                }}
                            />
                            {ads[currentAdIndex]?.title && (
                                <Box
                                    position="absolute"
                                    bottom={0}
                                    w="100%"
                                    bgGradient="linear(to-r, rgba(49, 130, 206, 0.85), rgba(49, 151, 149, 0.85))"
                                    color="white"
                                    px={4}
                                    py={1.5}
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    backdropFilter="blur(8px)"
                                    pointerEvents="none"
                                >
                                    <Box
                                        display="inline-block"
                                        animation="adMarquee 15s linear infinite"
                                        fontSize="sm"
                                        fontWeight="800"
                                        letterSpacing="wide"
                                    >
                                        {ads[currentAdIndex].title}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Flex w="100%" h="100%" align="center" justify="center" color="gray.400" fontSize="sm">
                            Waiting Room Console
                        </Flex>
                    )}
                </Box>
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
