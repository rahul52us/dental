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

const AttendanceCalendar = ({ type, close, applyGetAllRecords }: any) => {
  const [selectedDateTime, setSelectedDateTime] = useState<any>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleDateSelect = (info: any) => {
    setSelectedDateTime({
      start: info.start,
      end: info.end,
    });
    setOpenDrawer(true);
  };

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
            <b>
              {moment(selectedDateTime.start).format("DD MMM YYYY, hh:mm A")}
            </b>
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
            <AddForm applyGetAllRecords={applyGetAllRecords} close={close} selectedDateAndTime={selectedDateTime} />
          ) : (
            <EditForm />
          )}
        </Box>
      </CustomDrawer>
    </>
  );
};

export default AttendanceCalendar;
