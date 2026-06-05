"use client";
import React, { useState, useCallback } from "react";
import { Box, Heading, Flex, Button, Text, useColorModeValue } from "@chakra-ui/react";
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

const BookAppointmentPage = observer(() => {
    const {
        DoctorAppointment: { getDoctorAppointment },
        auth: { openNotification, userType, user },
    } = stores;

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

                // Get all unique sorted timeslots across all chairs
                const timeSlotsMap = new Map<string, { startTime: string; endTime: string }>();

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

                doc.save(`Dental_Schedule_${formattedDate}.pdf`);

                openNotification({
                    type: "success",
                    title: "Download Successful",
                    message: `Daily schedule for ${moment(selectedDate).format("DD MMM YYYY")} has been exported.`,
                });
            } else {
                throw new Error(res?.message || "Failed to retrieve daily schedule.");
            }
        } catch (error: any) {
            console.error("Error generating schedule PDF:", error);
            openNotification({
                type: "error",
                title: "Download Failed",
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

    const bgColor = useColorModeValue("gray.50", "gray.900");

    return (
        <Box p={4} bg={bgColor} minH="100vh">
            <Flex align="center" justify="space-between" mb={6} bg={useColorModeValue("white", "gray.800")} p={4} borderRadius="xl" boxShadow="sm">
                <Heading size="lg">Book Appointment</Heading>
                <Flex align="center" gap={4}>
                    {stores.auth.hasPermission('appointment', 'download') && (
                        <Button
                            leftIcon={<FiDownload />}
                            colorScheme="teal"
                            variant="solid"
                            onClick={handleDownloadSchedule}
                            isLoading={isDownloading}
                            borderRadius="xl"
                            boxShadow="sm"
                            _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                            _active={{ transform: "translateY(0)" }}
                            transition="all 0.2s"
                        >
                            Download Schedule
                        </Button>
                    )}
                    <Flex align="center" gap={3}>
                        <Button size="md" colorScheme="blue" onClick={goToPreviousDate} p={1}>
                            <ChevronLeftIcon fontSize={28} />
                        </Button>
                        <Text fontWeight="700" fontSize="lg" minW="220px" textAlign="center">
                            {moment(selectedDate).format("dddd, DD MMM YYYY")}
                        </Text>
                        <Button size="md" colorScheme="blue" onClick={goToNextDate} p={1}>
                            <ChevronRightIcon fontSize={28} />
                        </Button>
                    </Flex>
                </Flex>
            </Flex>

            <Box bg={useColorModeValue("white", "gray.800")} borderRadius="xl" boxShadow="md" p={2}>
                <DentistScheduler
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    handleTimeSlots={handleOpenAddForm}
                    createdAppointmentByCalender={createdAppointmentByCalender}
                />
            </Box>

            <CustomDrawer
                width="90vw"
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
        </Box>
    );
});

export default BookAppointmentPage;
