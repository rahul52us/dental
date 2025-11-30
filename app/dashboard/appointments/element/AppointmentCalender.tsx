import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box, Flex, Heading, Text, Icon, useColorModeValue } from "@chakra-ui/react";
import { FaCalendarAlt } from "react-icons/fa";
import moment from "moment";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import AddForm from "../component/AddForm";
import EditForm from "../component/EditForm";

const AttendanceCalendar = ({ isPatient, patientDetails, type, close, applyGetAllRecords, appointments }: any) => {
  const [selectedDateTime, setSelectedDateTime] = useState<any>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  // ⭐ VIBRANT COLOR PALETTE FOR DIFFERENT APPOINTMENTS
  const appointmentColors = [
    { bg: "#3B82F6", border: "#2563EB", text: "#FFFFFF" }, // Blue
    { bg: "#8B5CF6", border: "#7C3AED", text: "#FFFFFF" }, // Purple
    { bg: "#EC4899", border: "#DB2777", text: "#FFFFFF" }, // Pink
    { bg: "#F59E0B", border: "#D97706", text: "#FFFFFF" }, // Amber
    { bg: "#10B981", border: "#059669", text: "#FFFFFF" }, // Emerald
    { bg: "#06B6D4", border: "#0891B2", text: "#FFFFFF" }, // Cyan
    { bg: "#EF4444", border: "#DC2626", text: "#FFFFFF" }, // Red
    { bg: "#6366F1", border: "#4F46E5", text: "#FFFFFF" }, // Indigo
    { bg: "#14B8A6", border: "#0D9488", text: "#FFFFFF" }, // Teal
    { bg: "#F97316", border: "#EA580C", text: "#FFFFFF" }, // Orange
  ];

  // ⭐ ASSIGN COLOR BASED ON INDEX (CONSISTENT FOR EACH APPOINTMENT)
  const getAppointmentColor = (index: number) => {
    return appointmentColors[index % appointmentColors.length];
  };

  // ⭐ COLOR BASED ON STATUS (OPTIONAL - IF YOU WANT STATUS-BASED COLORING)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return { bg: "#3182CE", border: "#2C5282", text: "#FFFFFF" };
      case "in-progress": return { bg: "#D69E2E", border: "#B7791F", text: "#FFFFFF" };
      case "completed": return { bg: "#38A169", border: "#2F855A", text: "#FFFFFF" };
      case "cancelled": return { bg: "#E53E3E", border: "#C53030", text: "#FFFFFF" };
      case "rescheduled": return { bg: "#805AD5", border: "#6B46C1", text: "#FFFFFF" };
      case "arrived": return { bg: "#2F855A", border: "#276749", text: "#FFFFFF" };
      default: return { bg: "#A0AEC0", border: "#718096", text: "#FFFFFF" };
    }
  };

  const formatDateOnly = (isoDate: string) => {
    return moment(isoDate).format("YYYY-MM-DD");
  };

  const bookedEvents = appointments?.data?.map((item: any, index: number) => {
    const date = formatDateOnly(item.appointmentDate);
    
    // Choose color strategy: by index for variety, or by status
    const colors = getAppointmentColor(index); // Change to getStatusColor(item.status) if preferred
    
    return {
      id: item?._id,
      title: item?.patientName || "Booked",
      start: `${date}T${item?.startTime}`,
      end: `${date}T${item?.endTime}`,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text,
      display: "block", // Makes event fill the slot completely
      extendedProps: item,
    };
  }) || [];

  // ⭐ WHEN USER SELECTS A NEW DATE SLOT
  const handleDateSelect = (info: any) => {
    setSelectedDateTime({
      start: info.start,
      end: info.end,
    });
    setOpenDrawer(true);
  };

  // ⭐ FULLCALENDAR OPTIONS
  const calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    initialView: "timeGridWeek",
    selectable: true,
    select: handleDateSelect,
    editable: false,
    height: "80vh",

    // Disable all past dates
    validRange: { start: moment().startOf("day").toDate() },

    // Again prevent past selection
    selectAllow: (selectInfo: any) => {
      return moment(selectInfo.start).isSameOrAfter(moment(), "day");
    },

    // ⭐ SHOW EVENTS ON CALENDAR
    events: bookedEvents,

    // ⭐ EVENT STYLING
    eventClassNames: "custom-event",
    
    // ⭐ OPEN DRAWER WHEN CLICK ON EVENT
    eventClick: (info: any) => {
      setSelectedDateTime({
        start: info.event.start,
        end: info.event.end,
        eventData: info.event.extendedProps,
      });
      setOpenDrawer(true);
    },

    // ⭐ ENHANCED EVENT DISPLAY
    eventContent: (arg: any) => {
      return {
        html: `
          <div style="
            padding: 4px 8px;
            height: 100%;
            overflow: hidden;
            font-weight: 600;
            font-size: 13px;
            line-height: 1.4;
          ">
            ${arg.event.title}
          </div>
        `
      };
    },
  };

  const calendarBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <>
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        mb={4}
        p={4}
        bg={calendarBg}
        borderRadius="lg"
        shadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Flex align="center" gap={3}>
          <Icon as={FaCalendarAlt} color="blue.500" boxSize={5} />
          <Heading size="md" color="gray.700">
            Appointment Calendar
          </Heading>
        </Flex>

        {selectedDateTime && (
          <Text fontSize="sm" color="gray.500">
            Selected:{" "}
            <b>{moment(selectedDateTime.start).format("DD MMM YYYY, hh:mm A")}</b>
          </Text>
        )}
      </Flex>

      {/* Calendar */}
      <Box
        p={4}
        bg={calendarBg}
        borderRadius="xl"
        shadow="md"
        borderWidth="1px"
        borderColor={borderColor}
        _hover={{ shadow: "lg", transition: "0.2s" }}
        sx={{
          // ⭐ CUSTOM CSS FOR BETTER EVENT APPEARANCE
          ".fc-event": {
            cursor: "pointer",
            borderRadius: "4px",
            border: "2px solid",
            transition: "all 0.2s ease",
            opacity: "0.95",
          },
          ".fc-event:hover": {
            opacity: "1",
            transform: "scale(1.02)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
          ".fc-timegrid-event": {
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          },
          ".fc-daygrid-event": {
            borderRadius: "4px",
            padding: "2px 4px",
          },
        }}
      >
        <FullCalendar {...calendarOptions} />
      </Box>

      {/* Drawer */}
      <CustomDrawer
        width="80vw"
        open={openDrawer}
        close={() => setOpenDrawer(false)}
        title={
          selectedDateTime
            ? `Selected: ${moment(selectedDateTime.start).format(
                "DD MMM YYYY, hh:mm A"
              )}`
            : "Select a date & time"
        }
      >
        <Box p={2}>
          {type === "add" ? (
            <AddForm
              patientDetails={patientDetails}
              isPatient={isPatient}
              applyGetAllRecords={applyGetAllRecords}
              close={close}
              selectedDateAndTime={selectedDateTime}
            />
          ) : (
            <EditForm />
          )}
        </Box>
      </CustomDrawer>
    </>
  );
};

export default AttendanceCalendar