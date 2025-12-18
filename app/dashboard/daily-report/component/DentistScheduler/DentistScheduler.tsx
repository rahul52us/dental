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
import { SLOT_DURATION } from "../../utils/constant";
import stores from "../../../../store/stores";

/* ---------------------- HELPERS ---------------------- */

// Convert "HH:MM" → minutes
const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Convert HEX → RGBA (for light column background)
const hexToRGBA = (hex: string, alpha = 0.2) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Generate time slots
const generateTimeSlots = (appointments: any[]) => {
  let startMinutes = 0;
  let endMinutes = 24 * 60;

  if (appointments.length) {
    let min = Infinity;
    let max = -Infinity;

    appointments.forEach((apt) => {
      const start = toMinutes(apt.startTime);
      const end = start + apt.duration;
      min = Math.min(min, start);
      max = Math.max(max, end);
    });

    startMinutes = Math.max(0, min - 60);
    endMinutes = Math.min(24 * 60, max + 60);
  }

  const slots: string[] = [];
  let current = startMinutes;

  while (current < endMinutes) {
    const h = Math.floor(current / 60);
    const m = current % 60;

    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += SLOT_DURATION;
  }

  return slots;
};

/* ---------------------- APPOINTMENT CARD ---------------------- */

const AppointmentCard = ({
  appointment,
  chairColor,
  overlapIndex = 0,
  totalOverlaps = 1,
}: any) => {
  const heightMultiplier = appointment.duration / SLOT_DURATION;
  const heightStyle = `calc(${heightMultiplier * 100}% + ${
    heightMultiplier - 1
  }px)`;

  const widthPercent = totalOverlaps > 1 ? 92 / totalOverlaps : 96;
  const leftOffset = overlapIndex * (96 / totalOverlaps);

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
      bg={`${chairColor}22`}
      borderColor={chairColor}
      zIndex={10 + overlapIndex}
      transition="all 0.25s ease"
      _hover={{
        bg: `${chairColor}44`,
        boxShadow: "xl",
        transform: "translateY(-2px)",
        zIndex: 50,
      }}
    >
      <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
        {appointment.patientName}
      </Text>

      <Text fontSize="xs" fontWeight="medium" mt={1} noOfLines={1}>
        {appointment.treatment || "Consultation"}
      </Text>

      {appointment.duration >= 60 && (
        <Flex align="center" gap={1} mt={1.5} fontSize="xs">
          <RepeatClockIcon boxSize={3.5} />
          <Text fontWeight="medium">{appointment.duration} min</Text>
        </Flex>
      )}

      {appointment.notes && (
        <Text fontSize="xs" mt={1} noOfLines={2} opacity={0.9}>
          {appointment.notes}
        </Text>
      )}
    </Box>
  );
};

/* ---------------------- GRID ---------------------- */

const ScheduleGrid = ({
  timeSlots,
  chairs,
  appointments,
  handleTimeSlots,
}: any) => {
  const bg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.900");
  const timeHeaderBg = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

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

  return (
    <Box flex="1" px={6} pb={6} overflowX="auto">
      <Box bg={bg} borderRadius="2xl" boxShadow="2xl" borderWidth="1px">
        {/* HEADER */}
        <Grid
          templateColumns={`100px repeat(${chairs.length}, 1fr)`}
          bg={headerBg}
          borderBottomWidth="2px"
          position="sticky"
          top={0}
          zIndex={30}
        >
          <Box p={5} bg={timeHeaderBg} borderRightWidth="2px" />

          {chairs.map((chair: any) => (
            <Box key={chair.id} p={4} textAlign="center">
              <Flex direction="column" align="center" gap={2}>
                <Box w={12} h={12} borderRadius="full" bg={chair.color} />
                <Text fontWeight="extrabold">{chair.name}</Text>
                <Text fontSize="sm">Chair {chair.chairNo}</Text>
              </Flex>
            </Box>
          ))}
        </Grid>

        {/* BODY */}
        {timeSlots.map((time: string) => (
          <Grid
            key={time}
            templateColumns={`100px repeat(${chairs.length}, 1fr)`}
          >
            {/* TIME */}
            <Box
              py={4}
              px={3}
              bg={timeHeaderBg}
              borderRightWidth="2px"
              textAlign="center"
              fontWeight="bold"
            >
              {time}
            </Box>

            {/* CHAIRS */}
            {chairs.map((chair: any) => {
              const startingAppointments = getAppointmentsStartingAt(
                time,
                chair.id
              );
              const occupied = isSlotOccupied(time, chair.id);
              const hasConflict = startingAppointments.length > 1;

              const columnBg = hexToRGBA(chair.color, 0.07);
              const columnHoverBg = hexToRGBA(chair.color, 0.1);

              return (
                <Box
                  key={`${chair.id}-${time}`}
                  position="relative"
                  minH="70px"
                  borderRightWidth="1px"
                  borderBottomWidth="1px"
                  bg={hasConflict ? "red.50" : columnBg}
                  _hover={{
                    bg: hasConflict ? "red.100" : columnHoverBg,
                  }}
                  role="group"
                >
                  {startingAppointments.map((apt: any, index: number) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      chairColor={chair.color}
                      overlapIndex={index}
                      totalOverlaps={startingAppointments.length}
                    />
                  ))}

                  {!occupied && (
                    <Flex
                      position="absolute"
                      inset={0}
                      align="center"
                      justify="center"
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                    >
                      <IconButton
                        aria-label="Add appointment"
                        size="lg"
                        borderRadius="full"
                        bg="blue.500"
                        color="white"
                        icon={<Text fontSize="2xl">+</Text>}
                        onClick={() =>
                          handleTimeSlots?.({
                            open: true,
                            time,
                            chair,
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

/* ---------------------- MAIN ---------------------- */

export default function DentistScheduler({ handleTimeSlots }: any) {
  const {
    chairsStore: { getChairSummary },
  } = stores;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [chairs, setChairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const timeSlots = useMemo(
    () => generateTimeSlots(appointments),
    [appointments]
  );

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const res = await getChairSummary({});

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
              id: apt._id,
              patientName: apt.patient?.name || "Unknown",
              treatment: apt.title,
              startTime: apt.startTime,
              duration: toMinutes(apt.endTime) - toMinutes(apt.startTime),
              chairId: chair._id,
              notes: apt.description,
            });
          });
        });

        setChairs(chairList);
        setAppointments(allAppointments);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [getChairSummary]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <ScheduleGrid
      timeSlots={timeSlots}
      chairs={chairs}
      appointments={appointments}
      handleTimeSlots={handleTimeSlots}
    />
  );
}
