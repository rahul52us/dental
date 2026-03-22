"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Flex,
    Text,
    Avatar,
    Badge,
    IconButton,
    VStack,
    HStack,
    Tooltip,
    useColorModeValue,
    Spinner,
    Center,
    Divider,
    Button,
    Grid,
    SimpleGrid,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { CalendarIcon, CheckIcon, DeleteIcon, EditIcon, InfoIcon, RepeatClockIcon, SearchIcon } from "@chakra-ui/icons";
import { GiMedicalDrip, GiPsychicWaves } from "react-icons/gi";
import { format } from "date-fns";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import { copyToClipboard } from "../../../../config/utils/function";
import { genderOptions } from "../../../../config/constant";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";
import AppointmentDetailsView from "../../element/AppointmentDetailsView";
import AppointmentList from "../../Appointments";
import ViewPatient from "../../../patients/component/patient/ViewPatient";
import Treatment from "../../../toothTreatment/page";

const pulse = keyframes`
  0% { transform: translateY(-50%) scale(1); opacity: 0.6; }
  50% { transform: translateY(-50%) scale(1.04); opacity: 0.9; filter: drop-shadow(0 0 10px currentColor); }
  100% { transform: translateY(-50%) scale(1); opacity: 0.6; }
`;

const WaitingRoomWhatsApp = observer(({ selectedDate }: any): any => {
    const {
        chairsStore: { getChairSummary },
        auth: { openNotification },
    } = stores;

    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog/Drawer states
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [openHistory, setOpenHistory] = useState({ open: false, data: null as any });
    const [openTreatment, setOpenTreatment] = useState({ open: false, data: null as any });
    const [openAppointment, setOpenAppointment] = useState({ open: false, data: null as any });
    const [openWorkDone, setOpenWorkDone] = useState({ open: false, data: null as any });
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [openProfile, setOpenProfile] = useState(false);

    const fetchArrivedAppointments = async () => {
        setLoading(true);
        try {
            const res = await getChairSummary({
                date: format(selectedDate, "yyyy-MM-dd"),
                status: "arrived"
            });

            if (res?.status === "success") {
                const allApts: any[] = [];
                res.data.forEach((chair: any) => {
                    chair.appointments.forEach((apt: any) => {
                        allApts.push({
                            ...apt,
                            chairName: chair.chairName,
                            chairColor: chair.chairColor
                        });
                    });
                });
                // Sort by start time
                allApts.sort((a, b) => a.startTime.localeCompare(b.startTime));
                setAppointments(allApts);
            }
        } catch (error) {
            console.error("Error fetching arrived appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArrivedAppointments();
    }, [selectedDate]);

    const cardBg = useColorModeValue("white", "gray.800");
    const toolbarBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(20, 20, 20, 0.6)");
    const borderColor = useColorModeValue("rgba(0,0,0,0.06)", "rgba(255,255,255,0.08)");
    const mutedTextColor = useColorModeValue("gray.500", "gray.400");
    const labelTextColor = useColorModeValue("gray.800", "white");
    const softShadow = useColorModeValue("0 10px 30px -5px rgba(0,0,0,0.05)", "0 20px 40px -10px rgba(0,0,0,0.4)");

    if (loading) {
        return (
            <Center py={10}>
                <Spinner size="xl" color="brand.500" thickness="4px" />
            </Center>
        );
    }

    if (appointments.length === 0) {
        return (
            <Center py={20} flexDir="column">
                <Text fontSize="lg" color={mutedTextColor} fontWeight="700" letterSpacing="tight">Waitlist is empty</Text>
                <Text fontSize="sm" color="gray.500">Arrived patients will appear here in style.</Text>
            </Center>
        );
    }

    return (
        <Box w="100%" pb={8}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={7} p={3}>
                {appointments.map((apt: any) => {
                    const patient = apt.patient || {};
                    const chairColor = apt.chairColor || "#3182ce";
                    const personalInfo = patient?.profileDetails?.personalInfo || {};
                    const genderLabel = genderOptions.find((opt: any) => opt.value === personalInfo?.gender)?.label || "--";
                    const primaryPhone = patient?.mobileNumber || "--"
                    const maskedPhone = primaryPhone !== "--" ? `${patient?.mobileNumber.slice(0, 3)}••••${patient?.mobileNumber.slice(-3)}` : "--";

                    // Silk & Chair Color Aesthetics
                    const silkBg = useColorModeValue(`${chairColor}11`, `${chairColor}15`); // Very soft silk tint
                    const borderHover = useColorModeValue(`${chairColor}44`, `${chairColor}66`);

                    return (
                        <Box
                            key={apt._id}
                            bg={silkBg}
                            borderRadius="3xl"
                            borderWidth="1.5px"
                            borderColor={borderColor}
                            boxShadow={softShadow}
                            transition="all 0.5s cubic-bezier(0.19, 1, 0.22, 1)"
                            _hover={{
                                boxShadow: useColorModeValue(`0 35px 70px -15px ${chairColor}33`, `0 45px 90px -20px black`),
                                transform: "translateY(-12px)",
                                borderColor: borderHover,
                                bg: useColorModeValue(`${chairColor}15`, `${chairColor}22`) // Subtle lift on hover
                            }}
                            position="relative"
                            overflow="hidden"
                            display="flex"
                            flexDirection="column"
                            onClick={() => {
                                setSelectedAppointment(apt);
                                setOpenDetails(true);
                            }}
                        >
                            {/* Refined Atmospheric Radial Glow */}
                            <Box
                                position="absolute"
                                top="-10%"
                                right="-10%"
                                w="70%"
                                h="70%"
                                bgGradient={`radial(${chairColor}22 0%, transparent 75%)`}
                                pointerEvents="none"
                                zIndex={0}
                            />

                            {/* Refined Breathing Pillar */}
                            <Box
                                position="absolute"
                                left="12px"
                                top="50%"
                                h="55%"
                                w="8px"
                                bg={chairColor}
                                borderRadius="full"
                                animation={`${pulse} 5s infinite ease-in-out`}
                                color={chairColor}
                                zIndex={2}
                            />

                            <Box p={6} pl={10} flex={1} position="relative" zIndex={1}>
                                <Flex align="center" gap={5} mb={5}>
                                    <Box position="relative">
                                        <Avatar
                                            src={patient?.pic?.url}
                                            name={patient?.name}
                                            size="md"
                                            p="1px"
                                            bgGradient={`linear(to-br, ${chairColor}44, transparent)`}
                                            borderWidth="1.5px"
                                            borderColor={borderColor}
                                            boxShadow="lg"
                                        />
                                        <Box
                                            position="absolute"
                                            bottom="2px"
                                            right="2px"
                                            w="15px"
                                            h="15px"
                                            bg="green.500"
                                            borderRadius="full"
                                            border="2.5px solid"
                                            borderColor={cardBg}
                                            boxShadow={`0 0 10px green.500`}
                                        />
                                    </Box>

                                    <Box overflow="hidden">
                                        <Text
                                            fontWeight="800"
                                            fontSize="lg"
                                            color={labelTextColor}
                                            noOfLines={1}
                                            letterSpacing="-0.03em"
                                            cursor="pointer"
                                            _hover={{ textDecoration: "underline", color: "teal.600" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedUser(patient);
                                                setOpenProfile(true);
                                            }}
                                        >
                                            {patient?.name || "Unknown"}
                                        </Text>
                                        <HStack spacing={2} mt={1}>
                                            <Badge variant="subtle" colorScheme="gray" fontSize="9px" borderRadius="md" px={2} fontWeight="700">
                                                {patient?.code || "CODE"}
                                            </Badge>
                                        </HStack>
                                    </Box>
                                </Flex>

                                <VStack align="stretch" spacing={4}>
                                    <HStack justify="space-between">
                                        <Flex align="center" gap={2} fontSize="xs" fontWeight="700" color={mutedTextColor} letterSpacing="tight">
                                            <CalendarIcon boxSize={3} color={chairColor} />
                                            <Text>{apt.startTime} – {apt.endTime}</Text>
                                        </Flex>
                                        <Badge variant="subtle" colorScheme="green" fontSize="8px" px={2} borderRadius="full" letterSpacing="0.1em">ARRIVED</Badge>
                                    </HStack>

                                    {/* Glass Content Panel */}
                                    <Box
                                        bg={useColorModeValue("whiteAlpha.700", "whiteAlpha.100")}
                                        p={4}
                                        borderRadius="2xl"
                                        borderLeft="4px solid"
                                        borderLeftColor={chairColor}
                                        backdropFilter="blur(8px)"
                                        borderWidth="1px"
                                        borderColor={useColorModeValue("whiteAlpha.500", "whiteAlpha.100")}
                                        boxShadow="sm"
                                    >
                                        <Text fontSize="10px" color={chairColor} fontWeight="800" letterSpacing="0.1em" mb={1} textTransform="uppercase">
                                            Consultation
                                        </Text>
                                        <Text fontWeight="800" fontSize="sm" color={labelTextColor} noOfLines={1} letterSpacing="-0.01em">
                                            {apt.title || "Standard Checkup"}
                                        </Text>

                                        {apt.description && (
                                            <Tooltip label={apt.description} hasArrow placement="top" borderRadius="md">
                                                <Text fontSize="xs" mt={2} color={mutedTextColor} noOfLines={2} fontStyle="italic" lineHeight="short">
                                                    {apt.description}
                                                </Text>
                                            </Tooltip>
                                        )}

                                        <Flex align="center" gap={1.5} mt={3}>
                                            <Badge
                                                variant="subtle"
                                                bg={`${chairColor}15`}
                                                color={chairColor}
                                                px={2.5}
                                                py={0.8}
                                                borderRadius="md"
                                                fontSize="10px"
                                                fontWeight="800"
                                                display="inline-flex"
                                                alignItems="center"
                                                gap={1}
                                                borderWidth="1px"
                                                borderColor={`${chairColor}30`}
                                            >
                                                🪑 {apt.chairName}
                                            </Badge>
                                        </Flex>
                                   </Box>

                                    <Text fontSize="11px" color={mutedTextColor} fontWeight="700" ml={1} opacity={0.8}>📞 {maskedPhone}</Text>
                                </VStack>
                            </Box>

                            {/* Action Buttons Panel */}
                            <Flex
                                justify="stretch"
                                p={3}
                                bg={toolbarBg}
                                backdropFilter="blur(20px)"
                                borderTop="1px solid"
                                borderColor={borderColor}
                                gap={3}
                                zIndex={2}
                            >
                                <SimpleGrid columns={2} spacing={3} width="100%" px={4} pb={4} onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        bgGradient="linear(to-r, teal.400, teal.600)"
                                        color="white"
                                        leftIcon={<RepeatClockIcon />}
                                        size="sm"
                                        borderRadius="xl"
                                        fontSize="xs"
                                        fontWeight="800"
                                        boxShadow="0 4px 12px rgba(49, 151, 149, 0.25)"
                                        _hover={{
                                            bgGradient: "linear(to-r, teal.500, teal.700)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 6px 15px rgba(49, 151, 149, 0.4)"
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenHistory({ open: true, data: patient });
                                        }}
                                    >
                                        History
                                    </Button>
                                    <Button
                                        bgGradient="linear(to-r, purple.400, purple.600)"
                                        color="white"
                                        leftIcon={<GiMedicalDrip />}
                                        size="sm"
                                        borderRadius="xl"
                                        fontSize="xs"
                                        fontWeight="800"
                                        boxShadow="0 4px 12px rgba(128, 0, 128, 0.25)"
                                        _hover={{
                                            bgGradient: "linear(to-r, purple.500, purple.700)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 6px 15px rgba(128, 0, 128, 0.4)"
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenTreatment({ open: true, data: patient });
                                        }}
                                    >
                                        Treatments
                                    </Button>
                                    <Button
                                        bgGradient="linear(to-r, blue.400, blue.600)"
                                        color="white"
                                        leftIcon={<CalendarIcon />}
                                        size="sm"
                                        borderRadius="xl"
                                        fontSize="xs"
                                        fontWeight="800"
                                        boxShadow="0 4px 12px rgba(49, 130, 206, 0.25)"
                                        _hover={{
                                            bgGradient: "linear(to-r, blue.500, blue.700)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 6px 15px rgba(49, 130, 206, 0.4)"
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenAppointment({ open: true, data: patient });
                                        }}
                                    >
                                        Appointment
                                    </Button>
                                    <Button
                                        bgGradient="linear(to-r, orange.400, orange.600)"
                                        color="white"
                                        leftIcon={<CheckIcon />}
                                        size="sm"
                                        borderRadius="xl"
                                        fontSize="xs"
                                        fontWeight="800"
                                        boxShadow="0 4px 12px rgba(237, 137, 54, 0.25)"
                                        _hover={{
                                            bgGradient: "linear(to-r, orange.500, orange.700)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 6px 15px rgba(237, 137, 54, 0.4)"
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenWorkDone({ open: true, data: patient });
                                        }}
                                    >
                                        Work Done
                                    </Button>
                                </SimpleGrid>
                            </Flex>
                        </Box>
                    );
                })}
            </SimpleGrid>

            {/* Arrived Appointment Details Drawer */}
            <CustomDrawer
                width={"80vw"}
                open={openDetails}
                close={() => setOpenDetails(false)}
                title="Appointment Details"
            >
                <AppointmentDetailsView data={selectedAppointment} />
            </CustomDrawer>

            {/* History Drawer */}
            {openHistory.open && (
                <CustomDrawer
                    width="92%"
                    title={`Appointments History: ${openHistory.data?.name}`}
                    open={openHistory.open}
                    close={() => setOpenHistory({ open: false, data: null })}
                >
                    <AppointmentList
                        isPatient={true}
                        patientDetails={openHistory.data}
                    />
                </CustomDrawer>
            )}

            {/* Treatment Drawer */}
            {openTreatment.open && (
                <CustomDrawer
                    width="92%"
                    title={`Treatment History: ${openTreatment.data?.name}`}
                    open={openTreatment.open}
                    close={() => setOpenTreatment({ open: false, data: null })}
                >
                    <Treatment
                        isPatient={true}
                        patientDetails={openTreatment.data}
                    />
                </CustomDrawer>
            )}

            {/* Appointment Drawer */}
            {openAppointment.open && (
                <CustomDrawer
                    width="92%"
                    title={`Patient Appointments: ${openAppointment.data?.name}`}
                    open={openAppointment.open}
                    close={() => setOpenAppointment({ open: false, data: null })}
                >
                    <AppointmentList
                        isPatient={true}
                        patientDetails={openAppointment.data}
                    />
                </CustomDrawer>
            )}

            {/* Work Done Drawer Placeholder */}
            {openWorkDone.open && (
                <CustomDrawer
                    width="92%"
                    title={`Work Done: ${openWorkDone.data?.name}`}
                    open={openWorkDone.open}
                    close={() => setOpenWorkDone({ open: false, data: null })}
                >
                    <Box p={6}>
                        <Text fontWeight="600" color="gray.500">
                            📝 Procedure log or Note form placeholder loaded here. Add details inside soon!
                        </Text>
                    </Box>
                </CustomDrawer>
            )}


            {/* Profile Drawer */}
            <CustomDrawer
                width="90vw"
                open={openProfile}
                close={() => setOpenProfile(false)}
                title="Patient Profile"
            >
                {selectedUser && (
                    <ViewPatient
                        user={{
                            ...selectedUser,
                            ...selectedUser?.profileDetails?.personalInfo,
                        }}
                    />
                )}
            </CustomDrawer>
        </Box>
    );
});

export default WaitingRoomWhatsApp;
