"use client";
import React, { useState, useCallback } from "react";
import { Box, Heading, Flex, Button, Text, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, HStack, Icon, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import DentistScheduler from "../../daily-report/component/DentistScheduler/DentistScheduler";
import stores from "../../../store/stores";
import moment from "moment";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { tablePageLimit } from "../../../component/config/utils/variable";
import AddAppointmentForm from "../component/AddForm";
import EditAppointmentForm from "../component/EditForm";
import { SLOT_DURATION } from "../../daily-report/utils/constant";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import { FiDownload } from "react-icons/fi";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { useTranslation } from "react-i18next";

const BookAppointmentPage = observer(() => {
    const {
        DoctorAppointment: { getDoctorAppointment },
        auth: { openNotification, userType, user },
    } = stores;
    const { t, i18n } = useTranslation();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [createdAppointmentByCalender, setCreatedAppointmentByCalender] = useState(false);
    const [selectedDateAndTime, setSelectedDateTime] = useState<any>({
        open: false,
        chair: undefined,
        chairId: "",
        selectedDate: new Date(),
        time: "",
        start: null,
        end: null,
        type: "add",
    });

    const isPatient = userType === "patient";
    const patientDetails = isPatient ? user : null;

    const [isDownloading, setIsDownloading] = useState(false);
    const [pdfPreview, setPdfPreview] = useState<{ isOpen: boolean; url: string; doc: any; formattedDate: string }>({ isOpen: false, url: "", doc: null, formattedDate: "" });

    const toMinutes = (time: string) => {
        if (!time || typeof time !== "string" || !time.includes(":")) return 0;
        const [h, m] = time.split(":").map(Number);
        return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    };

    const parseHexToRGB = (hex: string): [number, number, number] => {
        if (!hex || typeof hex !== "string") return [13, 143, 159]; // Teal default
        const cleaned = hex.startsWith("#") ? hex.slice(1) : hex;
        if (cleaned.length === 3) {
            const r = parseInt(cleaned[0] + cleaned[0], 16) || 0;
            const g = parseInt(cleaned[1] + cleaned[1], 16) || 0;
            const b = parseInt(cleaned[2] + cleaned[2], 16) || 0;
            return [r, g, b];
        }
        if (cleaned.length === 6) {
            const r = parseInt(cleaned.slice(0, 2), 16) || 0;
            const g = parseInt(cleaned.slice(2, 4), 16) || 0;
            const b = parseInt(cleaned.slice(4, 6), 16) || 0;
            return [r, g, b];
        }
        return [13, 143, 159];
    };

    const handleDownloadSchedule = async () => {
        setIsDownloading(true);
        try {
            // Dynamic import to prevent any SSR build issues
            const { jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");

            const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
            const res = await stores.chairsStore.getChairSummary({ date: formattedDate });

            if (res?.status === "success") {
                const chairs = res.data || [];
                let totalScheduled = 0;
                let totalCompleted = 0;
                let totalCancelled = 0;
                const allAppointmentsCount: any[] = [];

                chairs.forEach((chair: any) => {
                    chair.appointments?.forEach((apt: any) => {
                        allAppointmentsCount.push(apt);
                        if (apt.status === "completed") totalCompleted++;
                        else if (apt.status === "cancelled") totalCancelled++;
                        else totalScheduled++;
                    });
                });

                // Get all standard timeslots across operating hours
                const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const selectedDayName = dayNames[selectedDate.getDay()];
                const dayConfig = user?.companyDetails?.operatingHours?.find(
                    (d: any) => d.day === selectedDayName && d.isOpen
                );

                let allowedSlots: any[] = [];
                if (dayConfig && dayConfig.slots) {
                    allowedSlots = dayConfig.slots.map((slot: any) => ({
                        startTime: slot.start,
                        endTime: slot.end,
                    }));
                }

                const timeSet = new Set<string>();
                const sameDayEnds = allowedSlots
                    .map((s: any) => toMinutes(s.endTime))
                    .filter((end: any) => end > 0 && end <= 24 * 60);
                const maxSameDayEnd = sameDayEnds.length ? Math.max(...sameDayEnds) : 24 * 60;

                allowedSlots.forEach((slot: any) => {
                    const start = toMinutes(slot.startTime);
                    const end = toMinutes(slot.endTime);
                    if (end > start) {
                        let current = start;
                        while (current < end) {
                            timeSet.add(
                                `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`
                            );
                            current += SLOT_DURATION;
                        }
                    } else {
                        let current = start;
                        while (current < maxSameDayEnd) {
                            timeSet.add(
                                `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`
                            );
                            current += SLOT_DURATION;
                        }
                    }
                });

                const timeSlotsMap = new Map<string, { startTime: string; endTime: string }>();

                Array.from(timeSet).forEach(time => {
                    const startMin = toMinutes(time);
                    const endMin = startMin + SLOT_DURATION;
                    timeSlotsMap.set(time, {
                        startTime: time,
                        endTime: `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`
                    });
                });

                chairs.forEach((chair: any) => {
                    chair.appointments?.forEach((apt: any) => {
                        if (apt.startTime) {
                            const key = apt.startTime;
                            if (!timeSlotsMap.has(key)) {
                                timeSlotsMap.set(key, {
                                    startTime: apt.startTime,
                                    endTime: apt.endTime || apt.startTime,
                                });
                            } else {
                                const current = timeSlotsMap.get(key)!;
                                if (toMinutes(apt.endTime) > toMinutes(current.endTime)) {
                                    current.endTime = apt.endTime;
                                }
                            }
                        }
                    });
                });

                const sortedTimeSlots = Array.from(timeSlotsMap.values()).sort((a, b) => {
                    return toMinutes(a.startTime) - toMinutes(b.startTime);
                });

                const doc = new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4",
                });

                // Theme color: Modern clinic teal
                const primaryColor = [13, 143, 159]; // RGB for #0D8F9F

                // 1. Draw top brand bar (No background to save ink)
                // doc.setFillColor(13, 143, 159);
                // doc.rect(0, 0, 210, 40, "F");

                // Draw solid gold accent bar at bottom of header
                // doc.setFillColor(212, 163, 89);
                // doc.rect(0, 38.5, 210, 1.5, "F");

                // Draw high-end clinic brand logo container (Removed)
                // doc.setFillColor(24, 165, 182);
                // doc.roundedRect(15, 9, 12, 12, 2.5, 2.5, "F");
                // doc.setFillColor(255, 255, 255);
                // doc.rect(20, 11, 2, 8, "F");
                // doc.rect(17, 14, 8, 2, "F");

                // Clinic name / title
                doc.setTextColor(33, 37, 41);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.text(user?.companyDetails?.company_name || "DENTAL CLINIC", 15, 16.5);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(8.5);
                doc.setTextColor(108, 117, 125);
                doc.text("DAILY APPOINTMENT BOOKING REPORT", 15, 21.5);

                // Clinic Address / Tel Metadata
                const address = user?.companyDetails?.addressInfo?.[0]?.address || "";
                const city = user?.companyDetails?.addressInfo?.[0]?.city || "";
                const contactNo = user?.companyDetails?.mobileNo || "";
                let clinicMeta = "";
                if (address) clinicMeta += address;
                if (city) clinicMeta += (clinicMeta ? ", " : "") + city;
                if (contactNo) clinicMeta += (clinicMeta ? " | Tel: " : "Tel: ") + contactNo;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(7.5);
                doc.setTextColor(108, 117, 125);
                doc.text(clinicMeta, 15, 26);

                // Generated info
                doc.setFontSize(6.5);
                doc.setTextColor(150, 150, 150);
                doc.text(`Generated on: ${moment().format("DD MMM YYYY, hh:mm A")}`, 15, 30.5);

                // Selected Date display (Right aligned)
                const dateStr = moment(selectedDate).format("dddd, DD MMMM YYYY").toUpperCase();
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(33, 37, 41);
                doc.text(dateStr, 195 - doc.getTextWidth(dateStr), 16.5);

                // Total bookings block (Right aligned)
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.5);
                doc.setTextColor(108, 117, 125);
                const bookingsText = `Total Bookings: ${allAppointmentsCount.length}`;
                doc.text(bookingsText, 195 - doc.getTextWidth(bookingsText), 22.5);

                // Clinic Status Badge (Right aligned pill shape)
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.5);
                doc.setTextColor(108, 117, 125);
                doc.text("Clinic Status:", 163 - doc.getTextWidth("Clinic Status:"), 29);

                // doc.setFillColor(34, 197, 94); // Modern Green #22C55E
                // doc.roundedRect(165, 25.5, 30, 5, 1.1, 1.1, "F");
                doc.setTextColor(34, 197, 94);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.5);
                doc.text("ACTIVE CLINIC", 180, 29.2, { align: "center" });

                // 3. Table Headers and Body
                const tableHeaders = [
                    [
                        "Time",
                        ...chairs.map((chair: any) => `${chair.chairName || `Chair ${chair.chairNo}`}\n(Chair ${chair.chairNo || ""})`)
                    ]
                ];

                const totalWidth = 180; // Total printable area width in mm
                const timeColWidth = 24; // 24mm for time column
                const numChairs = chairs.length || 1;
                const chairColWidth = (totalWidth - timeColWidth) / numChairs;

                const tableBody = sortedTimeSlots.map((slot) => {
                    const row = [
                        `${slot.startTime} - ${slot.endTime}\n(${toMinutes(slot.endTime) - toMinutes(slot.startTime)} min)`
                    ];

                    chairs.forEach((chair: any) => {
                        const apt = chair.appointments?.find((a: any) => a.startTime === slot.startTime);
                        if (apt) {
                            // Calculate dynamic text lines to let autoTable compute precise height of this cell
                            const availableWidth = chairColWidth - 12; // left padding (8) and right padding (4)

                            // Temporarily set font styling to get accurate splitting results
                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(8.5);
                            const nameLines = doc.splitTextToSize(apt.patient?.name || "Unknown", availableWidth);

                            doc.setFont("helvetica", "normal");
                            doc.setFontSize(7);
                            const phoneLines = doc.splitTextToSize(apt.patient?.mobileNumber || "--", availableWidth);

                            doc.setFont("helvetica", "italic");
                            doc.setFontSize(7);
                            const treatmentLines = doc.splitTextToSize(apt.title || apt.description || "Consultation", availableWidth);

                            // Join all lines with newlines
                            const nameStr = nameLines.join("\n");
                            const phoneStr = phoneLines.join("\n");
                            const treatmentStr = treatmentLines.join("\n");

                            row.push(`${nameStr}\n${phoneStr}\n${treatmentStr}`);
                        } else {
                            row.push("");
                        }
                    });

                    return row;
                });

                const columnStyles: any = {
                    0: { cellWidth: timeColWidth }
                };
                for (let i = 1; i <= numChairs; i++) {
                    columnStyles[i] = { cellWidth: chairColWidth };
                }

                // 5. Build high-fidelity AutoTable
                autoTable(doc, {
                    startY: 46,
                    head: tableHeaders,
                    body: tableBody,
                    theme: "grid",
                    headStyles: {
                        fillColor: [245, 245, 245],
                        textColor: [33, 37, 41],
                        fontStyle: "bold",
                        fontSize: 9,
                        halign: "center",
                        valign: "middle",
                    },
                    bodyStyles: {
                        textColor: [45, 55, 72],
                        fontSize: 8,
                        valign: "middle",
                        minCellHeight: 18, // Elegant minimum cell height
                    },
                    columnStyles: columnStyles,
                    styles: {
                        cellPadding: 4,
                        overflow: "linebreak",
                        lineColor: [220, 235, 238], // Very soft clinic-themed light border
                        lineWidth: 0.15,
                    },
                    margin: { left: 15, right: 15, bottom: 20 },
                    didParseCell: (data: any) => {
                        // Apply styling for Time header/column (column 0) to make it stand out
                        if (data.column.index === 0 && data.cell.section === "body") {
                            data.cell.styles.fillColor = [245, 249, 250];
                            data.cell.styles.fontStyle = "bold";
                            data.cell.styles.textColor = [74, 85, 104];
                        }
                        if (data.column.index >= 1) {
                            if (data.cell.section === "body") {
                                // Add extra bottom padding to allocate space for status pill badges
                                data.cell.styles.cellPadding = { left: 8, right: 4, top: 4, bottom: 8 };

                                // Apply soft pastel background of the chair color for appointment cells
                                const slot = sortedTimeSlots[data.row.index];
                                const chair = chairs[data.column.index - 1];
                                if (slot && chair) {
                                    const apt = chair.appointments?.find((a: any) => a && a.startTime === slot.startTime);
                                    if (apt && chair.chairColor) {
                                        const [r, g, b] = parseHexToRGB(chair.chairColor);
                                        const lightR = Math.round(r * 0.25 + 255 * 0.75);
                                        const lightG = Math.round(g * 0.25 + 255 * 0.75);
                                        const lightB = Math.round(b * 0.25 + 255 * 0.75);
                                        data.cell.styles.fillColor = [lightR, lightG, lightB];
                                    }
                                }
                            }
                        }
                    },
                    willDrawCell: (data: any) => {
                        if (data.cell.section === "body" && data.column.index >= 1) {
                            const slot = sortedTimeSlots[data.row.index];
                            const chair = chairs[data.column.index - 1];
                            if (slot && chair) {
                                const apt = chair.appointments?.find((a: any) => a && a.startTime === slot.startTime);
                                if (apt) {
                                    // Clear default plain-text to let didDrawCell draw premium card content
                                    data.cell.text = [];
                                }
                            }
                        }
                    },
                    didDrawCell: (data: any) => {
                        // Draw custom premium appointment card in body cells (index >= 1)
                        if (data.row.section === "body" && data.column.index >= 1) {
                            const slot = sortedTimeSlots[data.row.index];
                            const chair = chairs[data.column.index - 1];
                            if (slot && chair) {
                                const apt = chair.appointments?.find((a: any) => a && a.startTime === slot.startTime);

                                if (apt) {
                                    const docInstance = data.doc;
                                    const { x, y, width, height } = data.cell;

                                    const padLeft = 8;
                                    const startX = x + padLeft;
                                    const availableWidth = width - 12;

                                    let currentY = y + 5.5; // starting y offset

                                    // 1. Patient Name (Bold, Dark Charcoal)
                                    docInstance.setFont("helvetica", "bold");
                                    docInstance.setFontSize(8.5);
                                    docInstance.setTextColor(33, 37, 41);
                                    const nameLines = docInstance.splitTextToSize(apt.patient?.name || "Unknown", availableWidth);
                                    nameLines.forEach((line: string) => {
                                        docInstance.text(line, startX, currentY);
                                        currentY += 3.5;
                                    });

                                    // 2. Patient Phone Number (Small, Muted Gray)
                                    docInstance.setFont("helvetica", "normal");
                                    docInstance.setFontSize(7);
                                    docInstance.setTextColor(108, 117, 125);
                                    const phoneLines = docInstance.splitTextToSize(apt.patient?.mobileNumber || "--", availableWidth);
                                    phoneLines.forEach((line: string) => {
                                        docInstance.text(line, startX, currentY);
                                        currentY += 3.2;
                                    });

                                    // 4. Treatment description (Small, Italicized)
                                    docInstance.setFont("helvetica", "italic");
                                    docInstance.setFontSize(7);
                                    docInstance.setTextColor(108, 117, 125);
                                    const treatmentLines = docInstance.splitTextToSize(apt.title || apt.description || "Consultation", availableWidth);
                                    treatmentLines.forEach((line: string) => {
                                        docInstance.text(line, startX, currentY);
                                        currentY += 3.2;
                                    });

                                    // 5. Beautiful Status Badge (shifted slightly up and guaranteed to be well within bottom boundary)
                                    const status = (apt.status || "scheduled").toLowerCase();
                                    let bgR = 224, bgG = 242, bgB = 254; // Scheduled: soft blue
                                    let txR = 30, txG = 58, txB = 138;
                                    if (status === "completed") {
                                        bgR = 220; bgG = 252; bgB = 231; // Completed: soft green
                                        txR = 22; txG = 101; txB = 52;
                                    } else if (status === "cancelled") {
                                        bgR = 254; bgG = 226; bgB = 226; // Cancelled: soft red
                                        txR = 153; txG = 27; txB = 27;
                                    }

                                    docInstance.setFillColor(bgR, bgG, bgB);
                                    const pillX = startX;
                                    const pillY = y + height - 7.5; // Mathematically bound relative to the actual cell bottom border
                                    const pillW = width - 16;
                                    const pillH = 4.5;
                                    docInstance.roundedRect(pillX, pillY, pillW, pillH, 1.1, 1.1, "F");

                                    docInstance.setFont("helvetica", "bold");
                                    docInstance.setFontSize(6.5);
                                    docInstance.setTextColor(txR, txG, txB);
                                    const statusText = apt.status ? apt.status.toUpperCase() : "SCHEDULED";
                                    docInstance.text(statusText, pillX + (pillW / 2), pillY + 3.2, { align: "center" });
                                }
                            }
                        }
                    },
                    didDrawPage: (pageData: any) => {
                        // Footer on each page
                        doc.setFont("helvetica", "italic");
                        doc.setFontSize(8);
                        doc.setTextColor(160, 174, 192);
                        doc.text("CONFIDENTIAL CLINICAL RECORD - FOR INTERNAL USE ONLY", 15, 287);
                        const pgText = `Page ${pageData.pageNumber} of ${pageData.pageCount || pageData.pageNumber}`;
                        doc.text(pgText, 195 - doc.getTextWidth(pgText), 287);
                    }
                });

                const blob = doc.output("blob");
                const url = URL.createObjectURL(blob);
                setPdfPreview({ isOpen: true, url, doc, formattedDate });

                openNotification({
                    type: "success",
                    title: "Schedule Generated",
                    message: `Daily schedule for ${moment(selectedDate).format("DD MMM YYYY")} is ready for preview.`,
                });
            } else {
                throw new Error(res?.message || "Failed to retrieve daily schedule.");
            }
        } catch (error: any) {
            console.error("Error generating schedule PDF:", error);
            openNotification({
                type: "error",
                title: "Generation Failed",
                message: error?.message || "An error occurred while preparing the PDF document.",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const applyGetAllRecords = useCallback(
        ({ page = 1, limit = tablePageLimit, reset = false } = {}) => {
            const query: any = { page, limit };
            getDoctorAppointment(query)
                .then(() => { })
                .catch((err) => {
                    openNotification({
                        type: "error",
                        title: "Failed to get Appointments",
                        message: err?.message,
                    });
                });
        },
        [getDoctorAppointment, openNotification]
    );

    const handleOpenAddForm = (data: any) => {
        const selectedDateStr = moment(data.selectedDate).format("YYYY-MM-DD");
        const start = moment(`${selectedDateStr} ${data.time}`, "YYYY-MM-DD HH:mm");
        const end = start.clone().add(SLOT_DURATION, "minutes");

        setSelectedDateTime({
            selectedDate: data?.selectedDate || new Date(),
            start: start.toDate(),
            end: end.toDate(),
            time: data.time,
            chairId: data.chair?.id,
            chair: {
                label: data?.chair?.name,
                value: data?.chair?.id,
            },
            data: data?.appointment,
            open: true,
            type: data?.mode === "edit" ? "edit" : "add",
        });
    };

    const goToPreviousDate = () => {
        setSelectedDate((prev: any) => moment(prev).subtract(1, "day").toDate());
    };

    const goToNextDate = () => {
        setSelectedDate((prev: any) => moment(prev).add(1, "day").toDate());
    };

    const bgColor = useColorModeValue("#F4F7FA", "gray.900");

    return (
        <Box p={{ base: 2, sm: 3, lg: 5 }} bg={bgColor} minH="100%">
            <Flex
                direction={{ base: "column", md: "row" }}
                align={{ base: "stretch", md: "center" }}
                justify="space-between"
                gap={4}
                mb={4}
                p={{ base: 4, md: 5 }}
                borderRadius="24px"
                bgGradient="linear(125deg, #123B50 0%, #126C70 62%, #258F83 100%)"
                color="white"
                boxShadow="0 12px 28px rgba(18, 83, 96, 0.18)"
                position="relative"
                overflow="hidden"
            >
                <Box
                    position="absolute"
                    w="180px"
                    h="180px"
                    rounded="full"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    right="-45px"
                    top="-92px"
                    pointerEvents="none"
                />
                <HStack spacing={3} position="relative" zIndex={1}>
                    <Flex
                        w="46px"
                        h="46px"
                        rounded="16px"
                        align="center"
                        justify="center"
                        bg="whiteAlpha.200"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        flexShrink={0}
                    >
                        <Icon as={RiCalendarScheduleLine} boxSize={5} />
                    </Flex>
                    <VStack align="start" spacing={0.5} minW={0}>
                        <Text fontSize="10px" fontWeight="800" letterSpacing="1.2px" color="whiteAlpha.800" textTransform="uppercase">
                            Clinic schedule
                        </Text>
                        <Heading size={{ base: "md", md: "lg" }} letterSpacing="-0.5px" noOfLines={1}>
                            {t("sidebar.Book Appointment", "Book Appointment")}
                        </Heading>
                        <Text fontSize="xs" color="whiteAlpha.800" noOfLines={1}>
                            Select an open time to schedule a visit.
                        </Text>
                    </VStack>
                </HStack>

                <Flex direction={{ base: "column", sm: "row" }} align="stretch" gap={3} width={{ base: "100%", md: "auto" }} position="relative" zIndex={1}>
                    {stores.auth.hasPermission('appointment', 'download') && (
                        <Button
                            leftIcon={<FiDownload />}
                            bg="whiteAlpha.200"
                            color="white"
                            border="1px solid"
                            borderColor="whiteAlpha.300"
                            onClick={handleDownloadSchedule}
                            isLoading={isDownloading}
                            borderRadius="14px"
                            h="44px"
                            width={{ base: "100%", sm: "auto" }}
                            _hover={{ bg: "whiteAlpha.300" }}
                        >
                            {t("appointments.page.downloadSchedule", "Download Schedule")}
                        </Button>
                    )}
                </Flex>
            </Flex>

            <Flex
                direction={{ base: "column", sm: "row" }}
                align={{ base: "stretch", sm: "center" }}
                justify="space-between"
                gap={3}
                mb={4}
                p={{ base: 3, sm: 3.5 }}
                bg={useColorModeValue("white", "gray.800")}
                border="1px solid"
                borderColor={useColorModeValue("gray.100", "whiteAlpha.200")}
                borderRadius="20px"
                boxShadow="0 5px 18px rgba(19, 52, 69, 0.05)"
            >
                <HStack spacing={2} color={useColorModeValue("gray.500", "gray.400")}>
                    <Icon as={RiCalendarScheduleLine} color="teal.500" boxSize={4} />
                    <Text fontSize="xs" fontWeight="700">Selected day</Text>
                </HStack>
                <Flex align="center" justify="center" gap={2} width={{ base: "100%", sm: "auto" }}>
                        <Button aria-label="Previous day" size="sm" colorScheme="teal" variant="ghost" onClick={goToPreviousDate} p={1} minW="40px" h="40px" borderRadius="12px">
                            <ChevronLeftIcon fontSize={28} />
                        </Button>
                        <Text flex={1} minW={{ base: "100px", sm: "190px" }} fontWeight="800" color={useColorModeValue("#183B48", "white")} fontSize={{ base: "sm", sm: "md" }} textAlign="center" noOfLines={1}>
                            {moment(selectedDate).locale(i18n.language || "en").format("ddd, DD MMM YYYY")}
                        </Text>
                        <Button aria-label="Next day" size="sm" colorScheme="teal" variant="ghost" onClick={goToNextDate} p={1} minW="40px" h="40px" borderRadius="12px">
                            <ChevronRightIcon fontSize={28} />
                        </Button>
                        <Button size="sm" variant="outline" colorScheme="teal" borderRadius="12px" h="40px" onClick={() => setSelectedDate(new Date())}>
                            Today
                        </Button>
                </Flex>
            </Flex>

            <Box bg={useColorModeValue("white", "gray.800")} borderRadius="22px" boxShadow="0 8px 26px rgba(19, 52, 69, 0.06)" border="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} p={{ base: 1, md: 3 }} overflow="hidden" w="100%">
                <DentistScheduler
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    handleTimeSlots={handleOpenAddForm}
                    createdAppointmentByCalender={createdAppointmentByCalender}
                />
            </Box>

            <CustomDrawer
                width={{ base: "100%", md: "80%" }}
                open={selectedDateAndTime.open}
                close={() =>
                    setSelectedDateTime({
                        ...selectedDateAndTime,
                        open: false,
                    })
                }
                title={
                    selectedDateAndTime.type === "add"
                        ? `New Appointment - ${moment(selectedDateAndTime.start).format("HH:mm")}`
                        : `Edit Appointment - ${moment(selectedDateAndTime.start).format("HH:mm")}`
                }
            >
                <Box p={2}>
                    {selectedDateAndTime.type === "add" ? (
                        <AddAppointmentForm
                            isPatient={isPatient}
                            patientDetails={patientDetails}
                            applyGetAllRecords={applyGetAllRecords}
                            close={() => {
                                setCreatedAppointmentByCalender(!createdAppointmentByCalender);
                                setSelectedDateTime({ ...selectedDateAndTime, open: false });
                            }}
                            selectedDateAndTime={selectedDateAndTime}
                        />
                    ) : (
                        <EditAppointmentForm
                            isPatient={isPatient}
                            patientDetails={patientDetails}
                            applyGetAllRecords={applyGetAllRecords}
                            close={() => {
                                setSelectedDateTime({ ...selectedDateAndTime, open: false });
                                setCreatedAppointmentByCalender(!createdAppointmentByCalender);
                            }}
                            selectedDateAndTime={selectedDateAndTime}
                        />
                    )}
                </Box>
            </CustomDrawer>

            <CustomDrawer
                width={{ base: "100%", md: "80%" }}
                open={pdfPreview.isOpen}
                close={() => setPdfPreview({ ...pdfPreview, isOpen: false })}
                title="Preview Schedule"
            >
                <Flex direction="column" h="full" p={1}>
                    <Box flex="1" bg="gray.100" p={0} borderRadius="md" overflow="hidden">
                        <iframe src={`${pdfPreview.url}#toolbar=1&navpanes=0`} style={{ width: '100%', height: '80vh', border: 'none', borderRadius: '8px', display: 'block' }} title="Schedule Preview" />
                    </Box>
                    <Flex justify="flex-end" pt={4} gap={3}>
                        <Button variant="ghost" onClick={() => setPdfPreview({ ...pdfPreview, isOpen: false })}>
                            Close
                        </Button>
                        <Button colorScheme="brand" onClick={() => {
                            if (pdfPreview.doc) {
                                pdfPreview.doc.save(`Dental_Schedule_${pdfPreview.formattedDate}.pdf`);
                            }
                        }}>
                            Download PDF
                        </Button>
                    </Flex>
                </Flex>
            </CustomDrawer>
        </Box>
    );
});

export default BookAppointmentPage;
