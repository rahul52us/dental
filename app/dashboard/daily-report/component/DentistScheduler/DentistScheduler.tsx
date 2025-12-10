import { RepeatClockIcon } from "@chakra-ui/icons";
import {
    Box,
    Flex,
    Grid,
    IconButton,
    Text,
    useColorModeValue
} from "@chakra-ui/react";
import { useMemo } from "react";
import { CHAIRS, CLOSING_HOUR, INITIAL_APPOINTMENTS, OPENING_HOUR, SLOT_DURATION } from "../../utils/constant";

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

// --- Subcomponents ---

const AppointmentCard = ({ appointment, chair }: any) => {
  const heightMultiplier = appointment.duration / SLOT_DURATION;
  const heightStyle = {
    height: `calc(${heightMultiplier * 100}% + ${heightMultiplier - 1}px)`,
    zIndex: 10,
  };

//   const statusColors: Record<string, { bg: string; color: string }> = {
//     Scheduled: { bg: "blue.100", color: "blue.800" },
//     "In Progress": { bg: "green.100", color: "green.800" },
//     Completed: { bg: "gray.100", color: "gray.600" },
//     Cancelled: { bg: "red.100", color: "red.800" },
//   };

//   const status = appointment.status || "Scheduled";
//   const statusColor = statusColors[status] || statusColors["Scheduled"];

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      m={1}
      p={3}
      borderLeftWidth="4px"
      borderRadius="lg"
      boxShadow="sm"
      cursor="pointer"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ boxShadow: "md" }}
      bg={chair.bg}
      borderColor={chair.border}
      style={heightStyle}
    >
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontWeight="bold" fontSize="sm" color="gray.800" noOfLines={1}>
            {appointment.patientName}
          </Text>
          <Text
            fontSize="xs"
            fontWeight="medium"
            mt={1}
            color={chair.text}
            noOfLines={1}
          >
            {appointment.treatment}
          </Text>
        </Box>
        {/* <Box
          as="span"
          fontSize="9px"
          px={2}
          py={0.5}
          borderRadius="full"
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="wide"
          bg={statusColor.bg}
          color={statusColor.color}
        >
          {status === "In Progress" ? "Active" : status}
        </Box> */}
      </Flex>

      {appointment.duration >= 60 && (
        <Box mt={2} fontSize="xs" color="gray.500" noOfLines={3}>
          <Flex align="center" gap={1} mb={1}>
            <RepeatClockIcon  />
            <Text as="span">{appointment.duration} min</Text>
          </Flex>
          {appointment.notes}
        </Box>
      )}
    </Box>
  );
};

const ScheduleGrid = ({
  timeSlots,
  chairs,
  appointments,
}: {
  timeSlots: string[];
  chairs: any[];
  appointments: any[];
}) => {
  const tableBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("white", "gray.900");
  const timeColBg = useColorModeValue("gray.50", "gray.800");

  const getAppointmentStartingAt = (time: string, chairId: string) => {
    return appointments.find(
      (apt) => apt.startTime === time && apt.chairId === chairId
    );
  };

  const isSlotOccupied = (time: string, chairId: string) => {
    const [h, m] = time.split(":").map(Number);
    const slotMinutes = h * 60 + m;

    return appointments.some((apt) => {
      if (apt.chairId !== chairId) return false;
      const [ah, am] = apt.startTime.split(":").map(Number);
      const aptStartMinutes = ah * 60 + am;
      const aptEndMinutes = aptStartMinutes + apt.duration;

      return slotMinutes > aptStartMinutes && slotMinutes < aptEndMinutes;
    });
  };

  return (
    <Box flex="1"  px={6} pb={6}>
      <Box
        bg={tableBg}
        borderRadius="xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
        minW="800px"
      >
        {/* Header row - Chairs */}
        <Grid
          templateColumns="80px repeat(4, 1fr)"
          borderBottomWidth="1px"
          borderColor={borderColor}
          position="sticky"
          top={0}
          zIndex={20}
          bg={headerBg}
        >
          <Flex
            p={4}
            borderRightWidth="1px"
            borderColor="gray.100"
            bg={timeColBg}
            align="center"
            justify="center"
          >
            <RepeatClockIcon  color="#9ca3af" />
          </Flex>

          {chairs.map((chair) => (
            <Box
              key={chair.id}
              p={4}
              borderRightWidth="1px"
              borderColor="gray.100"
              _last={{ borderRightWidth: 0 }}
            >
              <Flex align="center" gap={2} mb={1}>
                {/* <Box as="span" fontSize="xl">
                  {chair.icon}
                </Box> */}
                <Text fontWeight="bold" color="gray.800">
                  {chair.name}
                </Text>
              </Flex>
         
            </Box>
          ))}
        </Grid>

        {/* Body rows - Time slots */}
        <Box position="relative">
          {timeSlots.map((time) => (
            <Grid
              key={time}
              templateColumns="80px repeat(4, 1fr)"
              role="row"
            >
              {/* Time Column */}
              <Box
                py={4}
                borderRightWidth="1px"
                borderColor="gray.100"
                textAlign="center"
                fontSize="xs"
                fontWeight="semibold"
                color="gray.500"
                position="relative"
                bg={timeColBg}
              >
                <Box
                  position="relative"
                  top="-12px"
                  display="inline-block"
                  bg={headerBg}
                  px={1}
                  zIndex={10}
                  borderRadius="sm"
                >
                  {time}
                </Box>
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="100%"
                  h="1px"
                  bg="gray.100"
                  transform="translateY(-50%)"
                />
              </Box>

              {/* Chair Columns for this time */}
              {chairs.map((chair) => {
                const appointment = getAppointmentStartingAt(time, chair.id);
                const occupied = isSlotOccupied(time, chair.id);

                return (
                  <Box
                    key={`${chair.id}-${time}`}
                    position="relative"
                    borderRightWidth="1px"
                    borderBottomWidth="1px"
                    borderColor="gray.100"
                    minH="60px"
                    _last={{ borderRightWidth: 0 }}
                    role="group"
                    _hover={
                      !appointment && !occupied
                        ? { bg: "gray.50" }
                        : undefined
                    }
                  >
                    {/* Appointment starting in this slot */}
                    {appointment && (
                      <AppointmentCard
                        appointment={appointment}
                        chair={chair}
                      />
                    )}

                    {/* Add button for empty slot */}
                    {!appointment && !occupied && (
                      <Flex
                        position="absolute"
                        inset={0}
                        opacity={0}
                        align="center"
                        justify="center"
                        transition="opacity 0.2s"
                        _groupHover={{ opacity: 1 }}
                        zIndex={0}
                      >
                        <IconButton
                          aria-label="Add booking"
                        //   icon={<Plus size={16} />}
                          size="sm"
                          borderRadius="full"
                          bg="blue.50"
                          color="blue.600"
                          _hover={{ bg: "blue.600", color: "white" }}
                          boxShadow="sm"
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

// --- Main Component ---

export default function DentistScheduler() {

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  return (
    <Box
      display="flex"
      flexDir="column"
      h="100vh"
      bg="gray.50"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      color="gray.800"
    >
      {/* <SchedulerHeader
        formattedDate={formattedDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
      /> */}

      <Box as="main" flex="1"  display="flex" flexDir="column">
        {/* <KPISection /> */}

        <ScheduleGrid
          timeSlots={timeSlots}
          chairs={CHAIRS}
          appointments={INITIAL_APPOINTMENTS}
        />
      </Box>
    </Box>
  );
}
