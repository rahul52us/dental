"use client";
import React, { useState, useCallback } from "react";
import { Box, Heading, Flex, Button, Text, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import WaitingRoomWhatsApp from "./component/WaitingRoomWhatsApp";
import moment from "moment";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
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

    const bgColor = useColorModeValue("gray.50", "gray.900");

    return (
        <Box p={4} bg={bgColor} minH="100vh">
            <Flex align="center" justify="space-between" mb={6} bg={useColorModeValue("white", "gray.800")} p={4} borderRadius="xl" boxShadow="sm">
                <Heading size="lg">Waiting Room</Heading>
                <Flex align="center" gap={3}>
                    <Button size="md" colorScheme="blue" onClick={goToPreviousDate} p={1}>
                        <ChevronLeftIcon fontSize={28} />
                    </Button>
                    <Text fontWeight="700" fontSize="lg" minW="220px" textAlign="center">
                        {moment(selectedDate).format("dddd, DD MMM YYYY")}
                    </Text>
                    <Button size="md" colorScheme="blue" onClick={goToNextDate} p={1}>
                        <ChevronRightIcon fontSize={28} />
                    </Button>
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
