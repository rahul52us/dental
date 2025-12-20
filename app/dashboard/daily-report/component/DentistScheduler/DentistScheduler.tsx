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
import { format } from "date-fns";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

/* ---------------------- HELPERS ---------------------- */

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const hexToRGBA = (hex: string, alpha = 0.2) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/* ✅ FULL 24 HOURS */
const generateTimeSlots = () => {
  const slots: string[] = [];
  let current = 0;

  while (current < 24 * 60) {
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
      bg={`${chairColor}22`}
      borderColor={chairColor}
      zIndex={10 + overlapIndex}
    >
      <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
        {appointment.patientName}
      </Text>

      <Text fontSize="xs" mt={1} noOfLines={1}>
        {appointment.treatment || "Consultation"}
      </Text>

      {appointment.duration >= 60 && (
        <Flex align="center" gap={1} mt={1} fontSize="xs">
          <RepeatClockIcon boxSize={3.5} />
          <Text>{appointment.duration} min</Text>
        </Flex>
      )}
    </Box>
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

  /* ✅ SLOT AVAILABILITY (working hours + future date only) */
  const isSlotAllowed = (time: string) => {
    if (isPastDate) return false;

    const dayIndex = selectedDate.getDay();
    const slotMinutes = toMinutes(time);

    return allowedSlots.some((slot: any) => {
      if (!slot.daysOfWeek.includes(dayIndex)) return false;

      const start = toMinutes(slot.startTime);
      const end = toMinutes(slot.endTime);

      // overnight support
      if (end < start) {
        return slotMinutes >= start || slotMinutes < end;
      }

      return slotMinutes >= start && slotMinutes < end;
    });
  };

  /* ✅ WORKING HOURS TEXT */
  const workingHoursText = useMemo(() => {
    if (isPastDate) return "Working hours: Not available (past date)";

    const dayIndex = selectedDate.getDay();
    const todaySlots = allowedSlots.filter((s: any) =>
      s.daysOfWeek.includes(dayIndex)
    );

    if (!todaySlots.length) return "Working hours: Closed today";

    return `Working hours: ${todaySlots
      .map((s: any) => `${s.startTime} – ${s.endTime}`)
      .join(", ")}`;
  }, [allowedSlots, selectedDate, isPastDate]);

  return (
    <Box flex="1" px={1} pb={1} overflowX="auto">
      <Box bg={bg} borderRadius="2xl" boxShadow="2xl" borderWidth="1px">
        {/* WORKING HOURS */}
        <Flex justify="space-between" align="center" px={4} py={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.600">
            {workingHoursText}
          </Text>
        </Flex>

        {/* HEADER */}
        <Grid
          templateColumns={`100px repeat(${chairs.length}, 1fr)`}
          bg={headerBg}
          borderBottomWidth="2px"
        >
          <Flex
            p={5}
            bg={timeHeaderBg}
            align="center"
            justify="center"
            borderRightWidth="2px"
          >
            <CustomInput
              type="date"
              name="date"
              // min={format(new Date(), "yyyy-MM-dd")} // ✅ BLOCK PAST DAYS
              value={selectedDate}
              onChange={(e: any) => {
                const [y, m, d] = e.target.value.split("-").map(Number);
                setSelectedDate(new Date(y, m - 1, d));
              }}
            />
          </Flex>

          {chairs.map((chair: any) => (
            <Box key={chair.id} p={4} textAlign="center">
              <Flex direction="column" align="center" gap={2}>
                <Box w={12} h={12} borderRadius="full" bg={chair.color} />
                <Text fontWeight="bold">{chair.name}</Text>
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
                  pointerEvents={allowed ? "auto" : "none"}
                  cursor={allowed ? "pointer" : "not-allowed"}
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

                  {!allowed && (
                    <Text
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      fontSize="xs"
                      color="gray.600"
                      fontWeight="semibold"
                    >
                      {"Closed"}
                    </Text>
                  )}

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
                        bg="blue.500"
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

/* ---------------------- MAIN ---------------------- */

const convertOperatingHoursToBusinessHours = (hours: any[]) =>
  hours
    .filter((d) => d.isOpen)
    .flatMap((d) => {
      const dayIndex = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ].indexOf(d.day);
      return d.slots.map((slot) => ({
        daysOfWeek: [dayIndex],
        startTime: slot.start,
        endTime: slot.end,
      }));
    });

export default function DentistScheduler({ handleTimeSlots ,selectedDate, setSelectedDate}: any) {
  const {
    chairsStore: { getChairSummary },
    auth: { user },
  } = stores;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [chairs, setChairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const allowedSlots = useMemo(
    () =>
      convertOperatingHoursToBusinessHours(
        user?.companyDetails?.operatingHours || []
      ),
    []
  );

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
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
              id: apt._id,
              patientName: apt.patient?.name || "Unknown",
              treatment: apt.title,
              startTime: apt.startTime,
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

    fetchAppointments();
  }, [selectedDate, getChairSummary]);

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
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      allowedSlots={allowedSlots}
    />
  );
}