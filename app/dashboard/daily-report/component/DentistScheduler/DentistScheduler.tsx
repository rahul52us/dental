import { RepeatClockIcon } from "@chakra-ui/icons";
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
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import stores from "../../../../store/stores";
import { SLOT_DURATION } from "../../utils/constant";
import { format } from "date-fns";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import AppointmentDetailsView from "../../../appointments/element/AppointmentDetailsView";
import CustomDrawer from "../../../../component/common/Drawer/CustomDrawer";

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
  onOpenDetails,
}: any) => {
  const heightMultiplier = appointment.duration / SLOT_DURATION;
  const heightStyle = `calc(${heightMultiplier * 100}% + ${
    heightMultiplier - 1
  }px)`;

  const widthPercent = totalOverlaps > 1 ? 92 / totalOverlaps : 96;
  const leftOffset = overlapIndex * (96 / totalOverlaps);

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
    </Box>
  }
>
  <Box
  position="absolute"
  top={0}
  left={`${leftOffset}%`}
  width={`${widthPercent}%`}
  height={heightStyle}
  m="1x"
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
  <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
    {appointment.patientName}
  </Text>

  {/* Doctor name (secondary) */}
  <Text fontSize="xs" color="gray.600" noOfLines={1}>
    Dr. {appointment.doctorName || "—"}
  </Text>

  {/* Treatment */}
  <Text fontSize="xs" mt={1} noOfLines={1}>
    {appointment.treatment || "Consultation"}
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

    const dayIndex = selectedDate.getDay();
    const slotMinutes = toMinutes(time);

    return allowedSlots.some((slot: any) => {
      if (!slot.daysOfWeek.includes(dayIndex)) return false;

      const start = toMinutes(slot.startTime);
      const end = toMinutes(slot.endTime);

      return end < start
        ? slotMinutes >= start || slotMinutes < end
        : slotMinutes >= start && slotMinutes < end;
    });
  };

  return (
    <Box flex="1" px={1} pb={1} overflowX="auto">
      <Box bg={bg} borderRadius="2xl" boxShadow="2xl" borderWidth="1px">
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
>
  {/* 🔹 Existing Appointments (ALWAYS clickable) */}
  {startingAppointments.map((apt: any, index: number) => (
    <AppointmentCard
      key={apt.id}
      appointment={apt}
      chairColor={chair.color}
      overlapIndex={index}
      totalOverlaps={startingAppointments.length}
      onOpenDetails={onOpenDetails}
    />
  ))}

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

export default function DentistScheduler({
  handleTimeSlots,
  selectedDate,
  setSelectedDate,
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

  const allowedSlots = useMemo(
    () =>
      user?.companyDetails?.operatingHours
        ? user.companyDetails.operatingHours
            .filter((d: any) => d.isOpen)
            .flatMap((d: any) => {
              const dayIndex = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].indexOf(d.day);
              return d.slots.map((slot: any) => ({
                daysOfWeek: [dayIndex],
                startTime: slot.start,
                endTime: slot.end,
              }));
            })
        : [],
    [user]
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
              doctorName: apt.primaryDoctor?.name || "--",
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
    <>
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
      />

      {/* ✅ ONLY NEW UI */}
      <CustomDrawer
        width={"80vw"}
        open={openDrawer}
        close={() => setOpenDrawer(false)}
        title="Appointment Details"
      >
              <AppointmentDetailsView data={{...selectedAppointment, _id : selectedAppointment?.id}} />
      </CustomDrawer>
    </>
  );
}