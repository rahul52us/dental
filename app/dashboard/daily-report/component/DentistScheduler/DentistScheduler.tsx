import { RepeatClockIcon, EditIcon } from "@chakra-ui/icons";
import { FiCheckCircle } from "react-icons/fi";
import {
  Box,
  Center,
  Flex,
  Grid,
  IconButton,
  Spinner,
  Text,
  useColorModeValue,
  Tooltip,
  Divider,
  Input,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import stores from "../../../../store/stores";
import { observer } from "mobx-react-lite";
import { SLOT_DURATION } from "../../utils/constant";
import { format } from "date-fns";
import AppointmentDetailsView from "../../../appointments/element/AppointmentDetailsView";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";

/* ---------------------- HELPERS ---------------------- */

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const canEditAppointment = (selectedDate: Date, startTime: string) => {
  // const now = new Date();
  // const [h, m] = startTime.split(":").map(Number);

  // const aptDate = new Date(selectedDate);
  // aptDate.setHours(h, m, 0, 0);

  // return aptDate >= now;
  return true
};


const hexToRGBA = (hex: string, alpha = 0.2) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const generateTimeSlots = (allowedSlots: any[]) => {
  const timeSet = new Set<string>();

  // 🔑 find the latest endTime that is still on the same day
  const sameDayEnds = allowedSlots
    .map((s) => toMinutes(s.endTime))
    .filter((end) => end > 0 && end <= 24 * 60);

  const maxSameDayEnd = sameDayEnds.length
    ? Math.max(...sameDayEnds)
    : 24 * 60;

  allowedSlots.forEach((slot) => {
    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);

    // ✅ Normal same-day slot
    if (end > start) {
      let current = start;
      while (current < end) {
        timeSet.add(
          `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(
            current % 60
          ).padStart(2, "0")}`
        );
        current += SLOT_DURATION;
      }
    }

    // ✅ Overnight slot → clamp to last valid same-day end
    else {
      let current = start;
      while (current < maxSameDayEnd) {
        timeSet.add(
          `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(
            current % 60
          ).padStart(2, "0")}`
        );
        current += SLOT_DURATION;
      }
    }
  });

  return Array.from(timeSet).sort(
    (a, b) => toMinutes(a) - toMinutes(b)
  );
};


/* ---------------------- APPOINTMENT CARD ---------------------- */

const AppointmentCard = ({
  appointment,
  chairColor,
  overlapIndex = 0,
  totalOverlaps = 1,
  selectedDate,
  chair,
  handleTimeSlots,
  onOpenDetails,
  shouldNotEditIcon,
  onRefresh
}: any) => {
  const [isLoading, setIsLoading] = useState(false);

  const heightMultiplier = appointment.duration / SLOT_DURATION;
  const heightStyle = `calc(${heightMultiplier * 100}% + ${heightMultiplier - 1
    }px)`;

  const widthPercent = totalOverlaps > 1 ? 92 / totalOverlaps : 96;
  const leftOffset = overlapIndex * (96 / totalOverlaps);

  const editable = canEditAppointment(selectedDate, appointment.startTime);

  return (
    <Tooltip
      hasArrow
      placement="right"
      openDelay={300}
      bg="gray.800"
      color="white"
      borderRadius="md"
      px={3}
      py={2}
      pointerEvents="auto"
      label={
        <Box>
          <Text fontWeight="bold" fontSize="sm">
            {appointment.patientName}
          </Text>

          <Text fontSize="xs" opacity={0.85}>
            👨‍⚕️ {appointment.doctorName || "—"}
          </Text>

          <Divider my={1} borderColor="gray.600" />

          <Text fontSize="xs">
            🩺 {appointment.treatment || "Consultation"}
          </Text>

          <Text fontSize="xs">
            ⏰ {appointment.startTime} • {appointment.duration} min
          </Text>

          {/* Full Description */}
          {appointment.description && (
            <Text fontSize="xs" mt={1} opacity={0.85} whiteSpace="pre-wrap">
              📝 {appointment.status === "scheduled" ? appointment.shiftOrCancelledReason || appointment.description : appointment.description}
            </Text>
          )}
        </Box>
      }


    >
      <Box
        position="absolute"
        top={0}
        left={`${leftOffset}%`}
        width={`${widthPercent}%`}
        height={heightStyle}
        m={1}
        p={1.5}
        borderLeftWidth="6px"
        borderRadius="lg"
        boxShadow="md"
        bg={`${chairColor}22`}
        borderColor={chairColor}
        zIndex={10 + overlapIndex}
        cursor="pointer"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails(appointment);
        }}
      >
        {/* Patient name (primary) */}
        <Flex align="center" maxW="calc(100% - 24px)">
          <Text
            fontWeight="600"
            fontSize="sm"
            color="gray.800"
            noOfLines={1}
            title={appointment.patientName}
          >
            {appointment.patientName}
          </Text>

          <Text
            fontSize="xs"
            color="gray.600"
            px={2}
            py="2px"
            borderRadius="full"
            fontWeight="500"
            whiteSpace="nowrap"
          >
            ({appointment?.patientMobileNumber})
          </Text>
        </Flex>
        {editable && (
          <Tooltip label="Edit appointment" hasArrow>
            <IconButton
              display={shouldNotEditIcon ? "none" : undefined}
              aria-label="Edit appointment"
              icon={<EditIcon />}
              size="xs"
              position="absolute"
              top="4px"
              right="4px"
              variant="ghost"
              zIndex={50}
              onMouseEnter={(e) => e.stopPropagation()}   // ✅ stop parent tooltip
              onMouseLeave={(e) => e.stopPropagation()}   // ✅ stop parent tooltip
              onClick={(e) => {
                e.stopPropagation();
                handleTimeSlots({
                  open: true,
                  mode: "edit",
                  appointment,
                  chair,
                  selectedDate,
                });
              }}
            />
          </Tooltip>
        )}

        {editable && appointment.status === "scheduled" && (
          <Tooltip label="Mark as arrived" hasArrow>
            <IconButton
              display={shouldNotEditIcon ? "none" : undefined}
              aria-label="Mark as arrived"
              icon={<FiCheckCircle strokeWidth={3} />}
              isLoading={isLoading}
              colorScheme="green"
              size="xs"
              position="absolute"
              top="30px"
              right="4px"
              variant="ghost"
              zIndex={50}
              onMouseEnter={(e) => e.stopPropagation()}
              onMouseLeave={(e) => e.stopPropagation()}
              onClick={async (e) => {
                e.stopPropagation();
                setIsLoading(true);
                try {
                  await stores.DoctorAppointment.updateAppointmentStatus({
                    id: appointment.id,
                    status: "arrived",
                  });
                  stores.auth.openNotification({
                    type: "success",
                    title: "Success",
                    message: "Appointment marked as arrived",
                  });
                  if (onRefresh) onRefresh();
                } catch (error: any) {
                  stores.auth.openNotification({
                    type: "error",
                    title: "Error",
                    message: error?.message || "Failed to update status",
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
            />
          </Tooltip>
        )}



        {/* Doctor name (secondary) */}
        <Text fontSize="xs" color="gray.600" noOfLines={1}>
          Dr. {appointment.doctorName || "—"}
        </Text>

        {/* Treatment */}
        <Text fontSize="xs" mt={1}>
          {(appointment.status === "scheduled" ? appointment.shiftOrCancelledReason || appointment.description : appointment.description || "Consultation").length > 15
            ? (appointment.status === "scheduled" ? appointment.shiftOrCancelledReason || appointment.description : appointment.description || "Consultation").slice(0, 15) + "..."
            : appointment.status === "scheduled" ? appointment.shiftOrCancelledReason || appointment.description : appointment.description || "Consultation"}
        </Text>


        {/* Duration */}
        {appointment.duration >= 60 && (
          <Flex align="center" gap={1} mt={1} fontSize="xs" color="gray.600">
            <RepeatClockIcon boxSize={3.5} />
            <Text>{appointment.duration} min</Text>
          </Flex>
        )}
      </Box>
    </Tooltip>
  );
};

/* ---------------------- SCHEDULE GRID ---------------------- */

const ScheduleGrid = ({
  timeSlots,
  chairs,
  appointments,
  handleTimeSlots,
  selectedDate,
  setSelectedDate,
  allowedSlots,
  onOpenDetails,
  shouldNotEditIcon,
  onRefresh
}: any) => {
  const bg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.900");
  const timeHeaderBg = useColorModeValue("gray.100", "gray.700");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = selectedDate < today;

  const getAppointmentsStartingAt = (time: string, chairId: string) =>
    appointments.filter(
      (apt: any) => apt.startTime === time && apt.chairId === chairId
    );

  const isSlotOccupied = (time: string, chairId: string) => {
    const slotMinutes = toMinutes(time);
    return appointments.some((apt: any) => {
      if (apt.chairId !== chairId) return false;
      const start = toMinutes(apt.startTime);
      const end = start + apt.duration;
      return slotMinutes >= start && slotMinutes < end;
    });
  };

  const isSlotAllowed = (time: string) => {
    if (isPastDate) return false;

    const slotMinutes = toMinutes(time);

    return allowedSlots.some((slot: any) => {
      const start = toMinutes(slot.startTime);
      const end = toMinutes(slot.endTime);

      // normal
      if (end > start) {
        return slotMinutes >= start && slotMinutes < end;
      }

      // overnight → only if within declared same-day range
      return slotMinutes >= start && slotMinutes < 24 * 60;
    });
  };


  const canEditAppointment = (selectedDate: Date, startTime: string) => {
    const now = new Date();
    const [h, m] = startTime.split(":").map(Number);

    const aptDate = new Date(selectedDate);
    aptDate.setHours(h, m, 0, 0);

    return aptDate >= now;
  };


  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return (
    <Box flex="1" px={1} pb={1} overflowX="auto" overflowY="auto" maxH={{ base: "65vh", md: "calc(100vh - 180px)" }}>
      <Box bg={bg} borderRadius="2xl" boxShadow="2xl" borderWidth="1px" minW="100%" w="max-content">
        <Grid
          templateColumns={`80px repeat(${chairs.length}, minmax(140px, 1fr))`}
          bg={headerBg}
          borderBottomWidth="2px"
          position="sticky"
          top={0}
          zIndex={100}
        >
          <Flex
            p={2}
            w={"100%"}
            bg={timeHeaderBg}
            align="center"
            justify="center"
            borderRightWidth="2px"
            borderBottomWidth="2px"
            position="sticky"
            left={0}
            top={0}
            zIndex={110}
          >
            <Flex>
              <Input
                type="date"
                name="date"
                value={formatDateForInput(selectedDate)}
                onChange={(e: any) => {
                  if (!e.target.value) return;
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  const newMonth = m - 1;
                  if (setSelectedDate) {
                    const oldMonth = selectedDate.getMonth();
                    const oldYear = selectedDate.getFullYear();
                    if (newMonth !== oldMonth || y !== oldYear) {
                      if (d === selectedDate.getDate()) {
                        setSelectedDate(new Date(y, newMonth, 1));
                      } else {
                        setSelectedDate(new Date(y, newMonth, d));
                      }
                    } else {
                      setSelectedDate(new Date(y, newMonth, d));
                    }
                  }
                }}
                sx={{
                  width: "60px",
                  height: "80px",
                  padding: "0",
                  textIndent: "-9999px",
                  cursor: "pointer",

                  "&::-webkit-datetime-edit": {
                    display: "none",
                  },

                  "&::-webkit-calendar-picker-indicator": {
                    position: "absolute",
                    right: "2px",
                    width: "50px",
                    height: "50px",
                    cursor: "pointer",
                  },
                }}
              />
            </Flex>
          </Flex>

          {chairs.map((chair: any) => (
            <Box key={chair.id} p={4} textAlign="center" zIndex={1} bg={headerBg}>
              <Flex direction="column" align="center" gap={2}>
                <Box w={10} h={10} borderRadius="full" bg={chair.color} />
                <Text fontWeight="bold" fontSize="sm">{chair.name}</Text>
                <Text fontSize="xs">Chair {chair.chairNo}</Text>
              </Flex>
            </Box>
          ))}
        </Grid>

        {timeSlots.map((time: string) => (
          <Grid
            key={time}
            templateColumns={`80px repeat(${chairs.length}, minmax(140px, 1fr))`}
          >
            <Box
              py={4}
              px={1}
              bg={timeHeaderBg}
              borderRightWidth="2px"
              textAlign="center"
              fontWeight="bold"
              fontSize="sm"
              position="sticky"
              left={0}
              zIndex={50}
            >
              {time}
            </Box>

            {chairs.map((chair: any) => {
              const startingAppointments = getAppointmentsStartingAt(
                time,
                chair.id
              );
              const occupied = isSlotOccupied(time, chair.id);
              const allowed = isSlotAllowed(time);

              return (
                <Box
                  key={`${chair.id}-${time}`}
                  position="relative"
                  minH="70px"
                  borderRightWidth="2px"
                  borderBottomWidth="2px"
                  borderColor="gray.400"
                  bg={allowed ? hexToRGBA(chair.color, 0.07) : "gray.100"}
                  opacity={allowed ? 1 : 0.45}
                >
                  {/* 🔹 Existing Appointments (ALWAYS clickable) */}
                  {startingAppointments.map((apt: any, index: number) => {
                    console.log(apt)
                    return (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        selectedDate={selectedDate}
                        handleTimeSlots={handleTimeSlots}
                        chairColor={chair.color}
                        overlapIndex={index}
                        totalOverlaps={startingAppointments.length}
                        onOpenDetails={onOpenDetails}
                        shouldNotEditIcon={shouldNotEditIcon}
                        onRefresh={onRefresh}
                      />
                    )
                  })}

                  {/* 🔒 Closed Slot Label (does NOT block appointments) */}
                  {!allowed && startingAppointments.length === 0 && (
                    <Text
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      fontSize="xs"
                      color="gray.600"
                      fontWeight="semibold"
                      zIndex={1} // behind appointment cards
                      pointerEvents="none"
                    >
                      Closed
                    </Text>
                  )}

                  {/* ➕ Add Appointment (ONLY if slot is allowed & empty) */}
                  {!occupied && allowed && (
                    <Flex
                      position="absolute"
                      inset={0}
                      align="center"
                      justify="center"
                      opacity={0}
                      _hover={{ opacity: 1 }}
                    >
                      <IconButton
                        aria-label="Add appointment"
                        size="lg"
                        borderRadius="full"
                        bg={stores.themeStore.themeConfig.colors.custom.light.primary}
                        color="white"
                        icon={<Text fontSize="2xl">+</Text>}
                        onClick={() =>
                          handleTimeSlots({
                            open: true,
                            time,
                            chair,
                            selectedDate,
                          })
                        }
                      />
                    </Flex>
                  )}
                </Box>
              );
            })}
          </Grid>
        ))}
      </Box>
    </Box>
  );
};

/* ---------------------- MOBILE TABBED GRID ---------------------- */

const MobileScheduleView = ({
  timeSlots,
  chairs,
  appointments,
  handleTimeSlots,
  selectedDate,
  setSelectedDate,
  allowedSlots,
  onOpenDetails,
  shouldNotEditIcon,
  onRefresh
}: any) => {
  const [selectedChairIndex, setSelectedChairIndex] = useState(0);

  const bg = useColorModeValue("white", "gray.800");
  const timeHeaderBg = useColorModeValue("gray.50", "gray.900");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = selectedDate < today;

  if (!chairs || chairs.length === 0) return null;

  const safeIndex = selectedChairIndex < chairs.length ? selectedChairIndex : 0;
  const currentChair = chairs[safeIndex];

  const getAppointmentsStartingAt = (time: string) =>
    appointments.filter(
      (apt: any) => apt.startTime === time && apt.chairId === currentChair.id
    );

  const isSlotOccupied = (time: string) => {
    const slotMinutes = toMinutes(time);
    return appointments.some((apt: any) => {
      if (apt.chairId !== currentChair.id) return false;
      const start = toMinutes(apt.startTime);
      const end = start + apt.duration;
      return slotMinutes >= start && slotMinutes < end;
    });
  };

  const isSlotAllowed = (time: string) => {
    if (isPastDate) return false;
    const slotMinutes = toMinutes(time);
    return allowedSlots.some((slot: any) => {
      const start = toMinutes(slot.startTime);
      const end = toMinutes(slot.endTime);
      if (end > start) {
        return slotMinutes >= start && slotMinutes < end;
      }
      return slotMinutes >= start && slotMinutes < 24 * 60;
    });
  };

  return (
    <Box flex="1" px={0} pb={4} overflowY="auto" maxH="calc(100vh - 160px)" bg={bg}>
      {/* Doctor Tabs (Pill Style) */}
      <Flex 
        overflowX="auto" 
        bg={bg} 
        py={4} 
        px={4} 
        gap={3} 
        position="sticky"
        top={0}
        zIndex={100}
        borderBottomWidth="1px"
        borderColor="gray.100"
        css={{
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none'
        }}
      >
        {chairs.map((chair: any, index: number) => {
          const isSelected = safeIndex === index;
          return (
            <Flex
              key={chair.id}
              direction="row"
              align="center"
              justify="center"
              bg={isSelected ? chair.color : "gray.50"}
              borderRadius="full"
              py={2.5}
              px={5}
              minW="fit-content"
              onClick={() => setSelectedChairIndex(index)}
              cursor="pointer"
              transition="all 0.2s"
              boxShadow={isSelected ? "md" : "none"}
            >
              {!isSelected && <Box w={2.5} h={2.5} borderRadius="full" bg={chair.color} mr={2} />}
              <Text fontWeight={isSelected ? "bold" : "semibold"} fontSize="sm" color={isSelected ? "white" : "gray.600"}>
                {chair.name}
              </Text>
            </Flex>
          );
        })}
      </Flex>

      {/* Grid for selected chair */}
      <Box bg={bg} mt={2} w="100%" minW="100%">
        {timeSlots.map((time: string) => {
          const startingAppointments = getAppointmentsStartingAt(time);
          const occupied = isSlotOccupied(time);
          const allowed = isSlotAllowed(time);

          return (
            <Flex
              key={time}
              w="100%"
              minH="70px"
              position="relative"
            >
              {/* Time Column */}
              <Flex
                w="65px"
                justify="center"
                pt={2}
                bg={bg}
                zIndex={50}
              >
                <Text fontWeight="600" fontSize="xs" color="gray.400">
                  {time}
                </Text>
              </Flex>

              {/* Slot Area */}
              <Box
                flex="1"
                position="relative"
                borderBottomWidth="1px"
                borderColor="gray.200"
                borderLeftWidth="2px"
                borderLeftColor={allowed ? hexToRGBA(currentChair.color, 0.4) : "transparent"}
                bg={allowed ? hexToRGBA(currentChair.color, 0.07) : "gray.100"}
                opacity={allowed ? 1 : 0.45}
                onClick={() => {
                  if (!occupied && allowed) {
                    handleTimeSlots({ open: true, time, chair: currentChair, selectedDate });
                  }
                }}
                cursor={!occupied && allowed ? "pointer" : "default"}
                _active={!occupied && allowed ? { bg: "gray.50" } : {}}
              >
                {/* Existing Appointments */}
                {startingAppointments.map((apt: any, index: number) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    selectedDate={selectedDate}
                    handleTimeSlots={handleTimeSlots}
                    chairColor={currentChair.color}
                    overlapIndex={index}
                    totalOverlaps={startingAppointments.length}
                    onOpenDetails={onOpenDetails}
                    shouldNotEditIcon={shouldNotEditIcon}
                    onRefresh={onRefresh}
                  />
                ))}

                {/* Closed Slot Label */}
                {!allowed && startingAppointments.length === 0 && (
                  <Center h="100%">
                    <Text fontSize="xs" color="gray.400" fontWeight="medium">
                      Closed
                    </Text>
                  </Center>
                )}

                {/* Subtle Add Hint (Visible on touch, no hover needed) */}
                {!occupied && allowed && (
                  <Flex align="center" pl={4} h="100%" opacity={0.3}>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                      + Tap to add
                    </Text>
                  </Flex>
                )}
              </Box>
            </Flex>
          );
        })}
      </Box>
    </Box>
  );
};

/* ---------------------- MAIN ---------------------- */

export default observer(function DentistScheduler({
  handleTimeSlots,
  selectedDate,
  setSelectedDate,
  createdAppointmentByCalender,
  shouldNotEditIcon
}: any) {
  const {
    chairsStore: { getChairSummary },
    auth: { user },
  } = stores;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [chairs, setChairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ONLY NEW STATE
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [openDrawer, setOpenDrawer] = useState<any>(false);


  const allowedSlots = useMemo(() => {
    if (!user?.companyDetails?.operatingHours) return [];

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const selectedDayName = dayNames[selectedDate.getDay()];

    const dayConfig = user.companyDetails.operatingHours.find(
      (d: any) => d.day === selectedDayName && d.isOpen
    );

    if (!dayConfig) return [];

    return dayConfig.slots.map((slot: any) => ({
      startTime: slot.start,
      endTime: slot.end,
    }));
  }, [user, selectedDate]);


  const timeSlots = useMemo(
    () => generateTimeSlots(allowedSlots),
    [allowedSlots]
  );

  const fetchAppointments = async () => {
    setLoading(true);
    const res = await getChairSummary({
      date: format(selectedDate, "yyyy-MM-dd"),
    });

    if (res?.status === "success") {
      const allAppointments: any[] = [];
      const chairList: any[] = [];

      res.data.forEach((chair: any) => {
        chairList.push({
          id: chair._id,
          name: chair.chairName,
          chairNo: chair.chairNo,
          color: chair.chairColor,
        });

        chair.appointments.forEach((apt: any) => {
          allAppointments.push({
            _id: apt._id,
            id: apt._id,
            patientName: apt.patient?.name || "Unknown",
            patientMobileNumber: apt.patient?.mobileNumber || "Unknown",
            treatment: apt.title,
            description: apt.description,
            doctorName: apt.primaryDoctor?.name || "--",
            doctorMobileNumber: apt.primaryDoctor?.mobileNumber || "--",
            startTime: apt.startTime,
            status: apt.status,
            shiftOrCancelledReason: apt.shiftOrCancelledReason,
            duration: toMinutes(apt.endTime) - toMinutes(apt.startTime),
            chairId: chair._id,
          });
        });
      });

      setChairs(chairList);
      setAppointments(allAppointments);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, getChairSummary, createdAppointmentByCalender]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <Box display={{ base: "none", lg: "block" }}>
        <ScheduleGrid
          timeSlots={timeSlots}
          chairs={chairs}
          appointments={appointments}
          handleTimeSlots={handleTimeSlots}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          allowedSlots={allowedSlots}
          onOpenDetails={(apt: any) => {
            setSelectedAppointment(apt);
            setOpenDrawer(true);
          }}
          shouldNotEditIcon={shouldNotEditIcon}
          onRefresh={fetchAppointments}
        />
      </Box>

      <Box display={{ base: "block", lg: "none" }}>
        <MobileScheduleView
          timeSlots={timeSlots}
          chairs={chairs}
          appointments={appointments}
          handleTimeSlots={handleTimeSlots}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          allowedSlots={allowedSlots}
          onOpenDetails={(apt: any) => {
            setSelectedAppointment(apt);
            setOpenDrawer(true);
          }}
          shouldNotEditIcon={shouldNotEditIcon}
          onRefresh={fetchAppointments}
        />
      </Box>

      {/* ✅ ONLY NEW UI */}
      <CustomDrawer
        width={"80vw"}
        open={openDrawer}
        close={() => setOpenDrawer(false)}
        title="Appointment Details"
      >
        <AppointmentDetailsView
          data={{ ...selectedAppointment, _id: selectedAppointment?.id }}
        />
      </CustomDrawer>
    </>
  );
});