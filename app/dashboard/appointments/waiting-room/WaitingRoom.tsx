"use client";
import React, { useState } from "react";
import { Box, Heading, Flex, Button, Text, useColorModeValue, HStack, IconButton, Icon, VStack, Badge } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import WaitingRoomWhatsApp from "./component/WaitingRoomWhatsApp";
import moment from "moment";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { MdOutlineAirlineSeatReclineExtra } from "react-icons/md";
import stores from "../../../store/stores";
import { useTranslation } from "react-i18next";

const WaitingRoomPage = observer((): any => {
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
            }, 15000);
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
    const resetToToday = () => {
        setSelectedDate(new Date());
    };

    return (
        <Box p={{ base: 2, sm: 3, xl: 6 }} bg={bgColor} minH="100%">
            {/* Elite Command Header */}
            <Flex
                direction={{ base: "column", lg: "row" }}
                align={{ base: "stretch", lg: "center" }}
                justify="space-between"
                mb={{ base: 4, md: 6 }}
                bg={containerBg}
                backdropFilter="blur(20px)"
                p={{ base: 4, md: 6 }}
                borderRadius={{ base: "22px", md: "3xl" }}
                boxShadow={useColorModeValue("0 12px 28px -16px rgba(0,0,0,0.16)", "0 20px 40px -20px rgba(0,0,0,0.5)")}
                border="1px solid"
                borderColor={borderColor}
                gap={{ base: 4, md: 6 }}
            >
                <HStack spacing={{ base: 3, md: 6 }} flexWrap="wrap" align="center">
                    <Box
                        w={{ base: "48px", md: "64px" }}
                        h={{ base: "48px", md: "64px" }}
                        bgGradient="linear(to-br, blue.400, teal.400)"
                        borderRadius={{ base: "16px", md: "2xl" }}
                        color="white"
                        boxShadow="0 15px 35px -10px rgba(49, 130, 206, 0.6)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <MdOutlineAirlineSeatReclineExtra size={26} />
                    </Box>
                    <VStack align="start" spacing={1} minW={0}>
                        <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
                            <Heading size={{ base: "md", md: "lg" }} fontWeight="900" letterSpacing="-0.04em" color={useColorModeValue("gray.800", "white")}>
                                {t("waitingRoom.title")}
                            </Heading>
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
                        <Text fontSize="xs" fontWeight="700" color={useColorModeValue("gray.500", "gray.300")} letterSpacing="0.02em">
                            {t("waitingRoom.subtitle")}
                        </Text>
                    </VStack>
                </HStack>

                <Box
                    display={ads.length > 0 ? "block" : "none"}
                    w={{ base: "100%", lg: "400px", xl: "450px" }}
                    h={{ base: "82px", md: "110px" }}
                    borderRadius="2xl"
                    overflow="hidden"
                    position="relative"
                    bg={useColorModeValue("white", "gray.800")}
                    border="1px solid"
                    borderColor={useColorModeValue("gray.100", "gray.700")}
                    boxShadow="0 10px 30px -10px rgba(0,0,0,0.1)"
                    _hover={{ 
                        boxShadow: "0 15px 35px -5px rgba(0,0,0,0.15)", 
                        transform: "translateY(-3px)",
                        "& .ad-image": { transform: "scale(1.05)" },
                        "& .ad-shine": { left: "100%" }
                    }}
                    transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                    cursor={ads[currentAdIndex]?.link ? "pointer" : "default"}
                    onClick={() => {
                        if (ads[currentAdIndex]?.link) window.open(ads[currentAdIndex].link, "_blank");
                    }}
                    role="group"
                >
                    {/* Shimmer effect on hover */}
                    <Box
                        className="ad-shine"
                        position="absolute"
                        top={0}
                        left="-100%"
                        w="50%"
                        h="100%"
                        bgGradient="linear(to-r, transparent, whiteAlpha.400, transparent)"
                        transform="skewX(-20deg)"
                        transition="left 0.7s ease"
                        zIndex={10}
                        pointerEvents="none"
                    />

                    {ads.length > 0 ? (
                        <Flex h="100%" align="stretch" position="relative" zIndex={1}>
                            {/* Left Side: Premium Image */}
                            <Box 
                                w={{ base: "100px", md: "140px" }} 
                                position="relative"
                                overflow="hidden"
                                bg="white"
                            >
                                <Box
                                    className="ad-image"
                                    as="img"
                                    src={ads[currentAdIndex]?.image?.url}
                                    w="100%"
                                    h="100%"
                                    objectFit="contain"
                                    transition="transform 0.5s ease"
                                    p={1}
                                />
                                {/* Glass Ad Badge */}
                                <Badge 
                                    position="absolute" 
                                    top={2} 
                                    left={2} 
                                    fontSize="7px" 
                                    bg="rgba(17, 24, 39, 0.7)"
                                    color="white"
                                    backdropFilter="blur(4px)"
                                    px={1.5}
                                    py={0.5}
                                    borderRadius="md"
                                    fontWeight="800"
                                    letterSpacing="widest"
                                    border="1px solid rgba(255,255,255,0.2)"
                                >
                                    AD
                                </Badge>
                                {/* Gradient blend to the right */}
                                <Box 
                                    position="absolute"
                                    top={0}
                                    right={0}
                                    w="20px"
                                    h="100%"
                                    bgGradient={`linear(to-l, ${useColorModeValue('white', '#1A202C')}, transparent)`}
                                />
                            </Box>
                            
                            {/* Right Side: Elegant Text Content with Vibrant Colors & Marquee */}
                            <Box 
                                flex={1} 
                                p={{ base: 3, md: 4 }} 
                                display="flex" 
                                flexDirection="column" 
                                justifyContent="center"
                                position="relative"
                                overflow="hidden"
                                bgGradient="linear(to-r, #2B6CB0, #319795)"
                                color="white"
                            >
                                <style>
                                    {`
                                      @keyframes textMarquee {
                                        0% { transform: translateX(100%); }
                                        100% { transform: translateX(-150%); }
                                      }
                                    `}
                                </style>

                                {ads[currentAdIndex]?.title ? (
                                    <Box position="relative" w="100%" h="20px" overflow="hidden">
                                        <Text 
                                            key={currentAdIndex}
                                            position="absolute"
                                            whiteSpace="nowrap"
                                            fontSize={{ base: "sm", md: "md" }} 
                                            fontWeight="800" 
                                            color="white"
                                            animation="textMarquee 15s linear infinite"
                                            letterSpacing="-0.01em"
                                        >
                                            {ads[currentAdIndex].title}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text fontSize="sm" color="whiteAlpha.800" fontStyle="italic">Sponsored Content</Text>
                                )}
                                
                                {ads[currentAdIndex]?.link && (
                                    <Flex 
                                        align="center"
                                        mt={2}
                                        zIndex={2}
                                    >
                                        <Text 
                                            fontSize="10px" 
                                            color="whiteAlpha.900" 
                                            fontWeight="800" 
                                            textTransform="uppercase"
                                            letterSpacing="0.05em"
                                        >
                                            Learn More
                                        </Text>
                                        <Box 
                                            as={ChevronRightIcon} 
                                            color="white"
                                            boxSize={4}
                                            ml={0.5}
                                            transition="transform 0.2s ease"
                                            _groupHover={{ transform: "translateX(4px)" }}
                                        />
                                    </Flex>
                                )}
                            </Box>
                        </Flex>
                    ) : (
                        <Flex w="100%" h="100%" align="center" justify="center" color="gray.400" fontSize="sm" bg={useColorModeValue("gray.50", "whiteAlpha.50")}>
                            Waiting Room Console
                        </Flex>
                    )}
                </Box>
            </Flex>

            <Flex
                align="center"
                justify="space-between"
                gap={2}
                mb={4}
                px={{ base: 2, md: 4 }}
                py={3}
                bg={useColorModeValue("white", "gray.800")}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="20px"
                boxShadow="0 5px 18px rgba(19, 52, 69, 0.05)"
            >
                <HStack spacing={2} minW={0} display={{ base: "none", sm: "flex" }}>
                    <CalendarIcon color="teal.500" />
                    <Text fontSize="xs" fontWeight="700" color={useColorModeValue("gray.500", "gray.400")} display={{ base: "none", sm: "block" }}>
                        Queue for
                    </Text>
                </HStack>
                <HStack
                    spacing={{ base: 0, sm: 1 }}
                    w={{ base: "100%", sm: "auto" }}
                    justify={{ base: "space-between", sm: "flex-start" }}
                >
                    <IconButton
                        aria-label="Previous day"
                        icon={<ChevronLeftIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="teal"
                        minW="32px"
                        h="36px"
                        borderRadius="12px"
                        onClick={goToPreviousDate}
                    />
                    <Text
                        flex={1}
                        minW={{ base: "60px", sm: "175px" }}
                        textAlign="center"
                        fontSize={{ base: "xs", sm: "sm" }}
                        fontWeight="800"
                        color={useColorModeValue("#183B48", "white")}
                        noOfLines={1}
                    >
                        {moment(selectedDate).format("ddd, DD MMM YYYY")}
                    </Text>
                    <IconButton
                        aria-label="Next day"
                        icon={<ChevronRightIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="teal"
                        minW="32px"
                        h="36px"
                        borderRadius="12px"
                        onClick={goToNextDate}
                    />
                    <Button
                        size="sm"
                        variant="outline"
                        colorScheme="teal"
                        borderRadius="12px"
                        px={{ base: 2, sm: 4 }}
                        minH="36px"
                        onClick={resetToToday}
                    >
                        Today
                    </Button>
                </HStack>
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
