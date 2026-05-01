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
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Icon,
    Heading,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { CalendarIcon, CheckIcon, DeleteIcon, EditIcon, InfoIcon, RepeatClockIcon, SearchIcon, SmallCloseIcon, RepeatIcon } from "@chakra-ui/icons";
import { GiMedicalDrip, GiPsychicWaves } from "react-icons/gi";
import { MdOutlineAirlineSeatReclineExtra } from "react-icons/md";
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
import WorkDoneForm from "../../../workDone/component/WorkDoneForm";
import WorkDoneList from "../../../workDone/component/WorkDoneList";
import PatientLabWorkHistory from "../../../patients/component/patient/PatientLabWorkHistory";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { FaFlask } from "react-icons/fa";

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
    const [openLab, setOpenLab] = useState({ open: false, data: null as any });
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [openProfile, setOpenProfile] = useState(false);

    // Confirmation for "Complete" (Close)
    const [openConfirm, setOpenConfirm] = useState({ open: false, id: "" });
    const [isCompleting, setIsCompleting] = useState(false);
    const cancelRef = React.useRef<any>(null);

    const handleComplete = async () => {
        setIsCompleting(true);
        try {
            const res = await stores.DoctorAppointment.completeAppointment(openConfirm.id);
            if (res.status === "success") {
                openNotification({
                    type: "success",
                    title: "Status: Completed",
                    message: "Patient marked as completed successfully."
                });
                fetchArrivedAppointments();
            }
        } catch (error: any) {
            openNotification({
                type: "error",
                title: "Update Failed",
                message: error?.message || "Something went wrong"
            });
        } finally {
            setIsCompleting(false);
            setOpenConfirm({ open: false, id: "" });
        }
    };

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
            <Center py={32} flexDir="column" textAlign="center">
                <Box
                    p={8}
                    bg={useColorModeValue("blue.50", "whiteAlpha.50")}
                    borderRadius="3xl"
                    mb={6}
                    position="relative"
                    _before={{
                        content: '""',
                        position: "absolute",
                        top: "-4px",
                        left: "-4px",
                        right: "-4px",
                        bottom: "-4px",
                        border: "1px dashed",
                        borderColor: "blue.200",
                        borderRadius: "4xl",
                        opacity: 0.5
                    }}
                >
                    <Icon
                        as={MdOutlineAirlineSeatReclineExtra}
                        boxSize={14}
                        color="blue.400"
                        animation={`${pulse} 3s infinite ease-in-out`}
                    />
                </Box>
                <VStack spacing={2}>
                    <Heading size="md" color={labelTextColor} fontWeight="900" letterSpacing="tight">
                        Queue is Empty
                    </Heading>
                    <Text fontSize="sm" color="gray.500" maxW="280px" fontWeight="600" lineHeight="tall">
                        Arrived patients will show up here. Everything is currently up to date!
                    </Text>
                    <Button
                        mt={6}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        leftIcon={<RepeatIcon />}
                        onClick={fetchArrivedAppointments}
                        borderRadius="xl"
                        fontWeight="800"
                    >
                        Refresh Queue
                    </Button>
                </VStack>
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
                    const displayPhone = primaryPhone;

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
                            {/* Premium Complete (Close) Action */}
                            <Tooltip label="Mark as Completed" hasArrow placement="top">
                                <IconButton
                                    aria-label="Complete appointment"
                                    icon={<SmallCloseIcon boxSize={4} />}
                                    size="sm"
                                    bgGradient="linear(to-br, teal.400, teal.600)"
                                    color="white"
                                    position="absolute"
                                    top={4}
                                    right={4}
                                    zIndex={10}
                                    borderRadius="full"
                                    boxShadow="0 4px 15px rgba(45, 170, 150, 0.4)"
                                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                    _hover={{
                                        transform: "rotate(90deg) scale(1.1)",
                                        boxShadow: "0 8px 25px rgba(45, 170, 150, 0.6)",
                                        bg: "teal.500"
                                    }}
                                    _active={{ transform: "scale(0.95)" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenConfirm({ open: true, id: apt._id });
                                    }}
                                />
                            </Tooltip>
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
                                        <Text fontWeight="800" fontSize="sm" color={labelTextColor} noOfLines={1} letterSpacing="-0.01em">
                                            {apt.description}
                                        </Text>



                                        <Flex align="center" gap={1.5} mt={3}>
                                            <Badge
                                                bg="gray.100"
                                                color="black"
                                                px={2.5}
                                                py={0.8}
                                                borderRadius="md"
                                                fontSize="10px"
                                                fontWeight="900"
                                                display="inline-flex"
                                                alignItems="center"
                                                gap={1}
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                            >
                                                👨‍⚕️ {apt.primaryDoctor?.name || "No Doctor"}
                                            </Badge>
                                        </Flex>
                                    </Box>

                                    <Text fontSize="11px" color={mutedTextColor} fontWeight="600" ml={1} opacity={0.8}>📞 {displayPhone}</Text>
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
                                        bgGradient="linear(to-r, pink.400, pink.600)"
                                        color="white"
                                        leftIcon={<FaFlask />}
                                        size="sm"
                                        borderRadius="xl"
                                        fontSize="xs"
                                        fontWeight="800"
                                        boxShadow="0 4px 12px rgba(237, 100, 166, 0.25)"
                                        _hover={{
                                            bgGradient: "linear(to-r, pink.500, pink.700)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 6px 15px rgba(237, 100, 166, 0.4)"
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenLab({ open: true, data: patient });
                                        }}
                                    >
                                        Lab
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
                    open={openWorkDone.open}
                    close={() => setOpenWorkDone({ open: false, data: null })}
                    title={`Work Done: ${openWorkDone.data?.name || "Patient"}`}
                    width={{ base: "100%", md: "90%" }}
                >
                    <Box p={2}>
                        <Tabs isFitted variant="enclosed" colorScheme="blue">
                            <TabList mb="1em">
                                <Tab fontWeight="bold" fontSize="14px">Create New Entry</Tab>
                                <Tab fontWeight="bold" fontSize="14px">Work History</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel p={0}>
                                    <WorkDoneForm
                                        patientDetails={openWorkDone.data}
                                        onSuccess={() => {
                                            setOpenWorkDone({ open: false, data: null });
                                        }}
                                    />
                                </TabPanel>
                                <TabPanel p={0}>
                                    <WorkDoneList patientDetails={openWorkDone.data} />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Box>
                </CustomDrawer>
            )}

            {/* Lab Drawer */}
            {openLab.open && (
                <CustomDrawer
                    width="92%"
                    title={`Laboratory History: ${openLab.data?.name}`}
                    open={openLab.open}
                    close={() => setOpenLab({ open: false, data: null })}
                >
                    <PatientLabWorkHistory
                        patientDetails={openLab.data}
                    />
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

            {/* Premium Confirmation Dialog for Completion */}
            <AlertDialog
                isOpen={openConfirm.open}
                leastDestructiveRef={cancelRef}
                onClose={() => setOpenConfirm({ open: false, id: "" })}
                isCentered
            >
                <AlertDialogOverlay backdropFilter="blur(10px)">
                    <AlertDialogContent borderRadius="3xl" overflow="hidden" boxShadow="2xl">
                        <Box bgGradient="linear(to-r, green.500, green.600)" py={6} px={8} color="white">
                            <AlertDialogHeader fontSize="xl" fontWeight="900" p={0} letterSpacing="tight">
                                Complete Appointment
                            </AlertDialogHeader>
                            <Text fontSize="xs" opacity={0.9} mt={1} fontWeight="600" letterSpacing="widest" textTransform="uppercase">
                                Confirmation Required
                            </Text>
                        </Box>

                        <AlertDialogBody py={8} px={8} fontWeight="700" color="gray.600" bg={useColorModeValue("white", "gray.800")}>
                            <VStack align="start" spacing={3}>
                                <Text fontSize="md" color={useColorModeValue("gray.800", "white")}>
                                    Are you ready to mark this visit as finished?
                                </Text>
                                <Text fontSize="sm" fontWeight="500" color="gray.500">
                                    The patient will be moved from the waiting list to the completed records. This action will be logged in the history.
                                </Text>
                            </VStack>
                        </AlertDialogBody>

                        <AlertDialogFooter px={8} py={6} gap={3} bg={useColorModeValue("gray.50", "gray.900/50")} borderTopWidth="1px" borderColor={borderColor}>
                            <Button
                                ref={cancelRef}
                                onClick={() => setOpenConfirm({ open: false, id: "" })}
                                borderRadius="2xl"
                                fontWeight="800"
                                variant="ghost"
                                size="lg"
                                fontSize="sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={handleComplete}
                                isLoading={isCompleting}
                                borderRadius="2xl"
                                fontWeight="800"
                                size="lg"
                                fontSize="sm"
                                boxShadow="0 10px 20px -5px rgba(72, 187, 120, 0.4)"
                                px={8}
                                _hover={{
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 15px 25px -5px rgba(72, 187, 120, 0.5)",
                                }}
                            >
                                Confirm & Complete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
});

export default WaitingRoomWhatsApp;
