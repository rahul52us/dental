import { RepeatClockIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Grid,
  IconButton,
  Text,
  useColorModeValue,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import {
  CLOSING_HOUR,
  OPENING_HOUR,
  SLOT_DURATION,
} from "../../utils/constant";
import stores from "../../../../store/stores";

// Helper: Convert "HH:MM" to minutes
const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Generate time slots
const generateTimeSlots = () => {
  const slots: string[] = [];
  const currentTime = new Date();
  currentTime.setHours(OPENING_HOUR, 0, 0, 0);

  const endTime = new Date();
  endTime.setHours(CLOSING_HOUR, 0, 0, 0);

  while (currentTime < endTime) {
    const timeString = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    slots.push(timeString);
    currentTime.setMinutes(currentTime.getMinutes() + SLOT_DURATION);
  }

  return slots;
};

// Appointment Card - Clean & Professional
const AppointmentCard = ({
  appointment,
  chairColor,
  overlapIndex = 0,
  totalOverlaps = 1,
}: {
  appointment: any;
  chairColor: string;
  overlapIndex?: number;
  totalOverlaps?: number;
}) => {
  const heightMultiplier = appointment.duration / SLOT_DURATION;
  const heightStyle = `calc(${heightMultiplier * 100}% + ${heightMultiplier - 1}px)`;

  const widthPercent = totalOverlaps > 1 ? 92 / totalOverlaps : 96;
  const leftOffset = overlapIndex * (96 / totalOverlaps);

  const bg = `${chairColor}22`;
  const hoverBg = `${chairColor}44`;

  return (
    <Box
      position="absolute"
      top={0}
      left={`${leftOffset}%`}
      width={`${widthPercent}%`}
      height={heightStyle}
      m="3px"
      p={2.5}
      borderLeftWidth="6px"
      borderRadius="lg"
      boxShadow="md"
      cursor="pointer"
      overflow="hidden"
      bg={bg}
      borderColor={chairColor}
      zIndex={10 + overlapIndex}
      transition="all 0.25s ease"
      _hover={{
        bg: hoverBg,
        boxShadow: "xl",
        transform: "translateY(-2px)",
        zIndex: 50,
      }}
    >
      <Text fontWeight="bold" fontSize="sm" color="gray.800" noOfLines={1}>
        {appointment.patientName}
        {appointment.primaryDoctor && appointment.primaryDoctor !== "Unknown" && (
          <Text as="span" fontWeight="medium" color="gray.600" fontSize="xs" ml={1}>
            ({appointment.primaryDoctor})
          </Text>
        )}
      </Text>

      <Text fontSize="xs" color="gray.700" fontWeight="medium" noOfLines={1} mt={1}>
        {appointment.treatment || "Consultation"}
      </Text>

      {appointment.duration >= 60 && (
        <Flex align="center" gap={1} mt={1.5} fontSize="xs" color="gray.600">
          <RepeatClockIcon boxSize={3.5} />
          <Text fontWeight="medium">{appointment.duration} min</Text>
        </Flex>
      )}

      {appointment.notes && (
        <Text fontSize="xs" color="gray.600" mt={1} noOfLines={2} opacity={0.9}>
          {appointment.notes}
        </Text>
      )}
    </Box>
  );
};

// Main Grid - Beautiful Header Design
const ScheduleGrid = ({
  timeSlots,
  chairs,
  appointments,
}: {
  timeSlots: string[];
  chairs: any[];
  appointments: any[];
}) => {
  const bg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.900");
  const timeHeaderBg = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  const getAppointmentsStartingAt = (time: string, chairId: string) => {
    return appointments.filter(
      (apt) => apt.startTime === time && apt.chairId === chairId
    );
  };

  const isSlotOccupied = (time: string, chairId: string) => {
    const slotMinutes = toMinutes(time);
    return appointments.some((apt) => {
      if (apt.chairId !== chairId) return false;
      const start = toMinutes(apt.startTime);
      const end = start + apt.duration;
      return slotMinutes >= start && slotMinutes < end;
    });
  };

  return (
    <Box flex="1" px={6} pb={6} overflowX="auto">
      <Box
        bg={bg}
        borderRadius="2xl"
        boxShadow="2xl"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        {/* Header Row - Chair Names with Color Indicators */}
        <Grid
          templateColumns={`100px repeat(${chairs.length}, 1fr)`}
          bg={headerBg}
          borderBottomWidth="2px"
          borderColor={borderColor}
          position="sticky"
          top={0}
          zIndex={30}
        >
          {/* Time Header Corner */}
          <Box
            p={5}
            bg={timeHeaderBg}
            borderRightWidth="2px"
            borderColor={borderColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <RepeatClockIcon boxSize={6} color="gray.500" />
          </Box>

          {/* Chair Headers */}
          {chairs.map((chair) => (
            <Box
              key={chair.id}
              p={4}
              textAlign="center"
              borderRightWidth="1px"
              borderColor={borderColor}
              _last={{ borderRightWidth: 0 }}
            >
              <Flex direction="column" align="center" gap={2}>
                <Box
                  w={12}
                  h={12}
                  borderRadius="full"
                  bg={chair.color}
                  borderWidth="3px"
                  borderColor={chair.color}
                />
                <Text fontWeight="extrabold" fontSize="lg" color="gray.800">
                  {chair.name}
                </Text>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Chair {chair.chairNo}
                </Text>
              </Flex>
            </Box>
          ))}
        </Grid>

        {/* Time Rows */}
        <Box>
          {timeSlots.map((time) => (
            <Grid
              key={time}
              templateColumns={`100px repeat(${chairs.length}, 1fr)`}
              _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
              transition="background 0.2s"
            >
              {/* Time Label */}
              <Box
                py={4}
                px={3}
                borderRightWidth="2px"
                borderBottomWidth="1px"
                borderColor={borderColor}
                textAlign="center"
                fontWeight="bold"
                fontSize="md"
                color="gray.700"
                bg={timeHeaderBg}
                position="relative"
              >
                <Text
                  bg={bg}
                  px={3}
                  py={1}
                  borderRadius="full"
                  boxShadow="sm"
                  minW="60px"
                >
                  {time}
                </Text>
              </Box>

              {/* Chair Cells */}
              {chairs.map((chair) => {
                const startingAppointments = getAppointmentsStartingAt(time, chair.id);
                const occupied = isSlotOccupied(time, chair.id);
                const hasConflict = startingAppointments.length > 1;

                return (
                  <Box
                    key={`${chair.id}-${time}`}
                    position="relative"
                    borderRightWidth="1px"
                    borderBottomWidth="1px"
                    borderColor={borderColor}
                    minH="70px"
                    _last={{ borderRightWidth: 0 }}
                    role="group"
                    bg={hasConflict ? "red.50" : undefined}
                  >
                    {/* Conflict Warning on Hover */}
                    {hasConflict && (
                      <Box
                        position="absolute"
                        inset={0}
                        bg="red.600"
                        opacity={0}
                        _groupHover={{ opacity: 0.9 }}
                        transition="opacity 0.3s"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        zIndex={40}
                        borderRadius="lg"
                        m={2}
                        pointerEvents="none"
                      >
                        <Text
                          fontWeight="bold"
                          color="white"
                          fontSize="md"
                          textShadow="0 1px 4px rgba(0,0,0,0.6)"
                        >
                          ⚠️ CONFLICT ({startingAppointments.length})
                        </Text>
                      </Box>
                    )}

                    {/* Appointments */}
                    {startingAppointments.map((apt: any, index: number) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        chairColor={chair.color}
                        overlapIndex={index}
                        totalOverlaps={startingAppointments.length}
                      />
                    ))}

                    {/* Add Button */}
                    {!occupied && (
                      <Flex
                        position="absolute"
                        inset={0}
                        align="center"
                        justify="center"
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                        transition="opacity 0.3s"
                        zIndex={5}
                      >
                        <IconButton
                          aria-label="Add appointment"
                          size="lg"
                          borderRadius="full"
                          bg="blue.500"
                          color="white"
                          icon={<Text fontSize="2xl">+</Text>}
                          _hover={{ bg: "blue.600", transform: "scale(1.1)" }}
                          boxShadow="lg"
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
    </Box>
  );
};

// Main Component (unchanged logic)
export default function DentistScheduler() {
  const { chairsStore: { getChairSummary } } = stores;
  const [appointments, setAppointments] = useState<any[]>([]);
  const [chairs, setChairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await getChairSummary({});

        if (res?.status === "success" && res?.data) {
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
              const duration = toMinutes(apt.endTime) - toMinutes(apt.startTime);

              allAppointments.push({
                id: apt._id,
                patientName: apt.patient?.name || "Unknown",
                primaryDoctor: apt.primaryDoctor?.name || "Unknown",
                treatment: apt.title || "",
                startTime: apt.startTime,
                duration,
                chairId: chair._id,
                notes: apt.description || "",
              });
            });
          });

          setChairs(chairList);
          setAppointments(allAppointments);
        }
      } catch (err) {
        console.error("Error fetching appointments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [getChairSummary]);

  if (loading) {
    return (
      <Center h="100vh" bg="gray.50">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box
      display="flex"
      flexDir="column"
      h="100vh"
      bg="gray.50"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      color="gray.800"
    >
      <Box as="main" flex="1" display="flex" flexDir="column">
        <ScheduleGrid
          timeSlots={timeSlots}
          chairs={chairs}
          appointments={appointments}
        />
      </Box>
    </Box>
  );
}