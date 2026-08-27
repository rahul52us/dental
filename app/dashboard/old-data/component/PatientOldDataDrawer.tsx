import React, { useState } from "react";
import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Text,
  Badge,
  Spinner,
  Center,
  HStack,
  Flex,
  Icon,
  Tooltip,
  useColorModeValue,
  Input,
  Button
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import { FiDatabase, FiPrinter } from "react-icons/fi";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PatientOldDataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
}

const PatientOldDataDrawer = observer(({ isOpen, onClose, patient }: PatientOldDataDrawerProps) => {
  const { oldDataStore } = stores;
  const loading = oldDataStore.patientOldDataLoading;
  const rows = oldDataStore.patientOldData;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const headerBg = useColorModeValue("blue.600", "blue.800");
  const bodyBg = useColorModeValue("gray.50", "gray.900");

  const columns = [
    {
      headerName: "Work Date",
      key: "Work_Date",
      type: "text",
      props: { row: { minW: 110 } },
    },
    {
      headerName: "Doctor",
      key: "Doctor",
      type: "text",
      props: { row: { minW: 130 } },
    },
    {
      headerName: "Stage",
      key: "Treatment_Stage",
      type: "component",
      metaData: {
        component: (dt: any) =>
          dt.Treatment_Stage ? (
            <Badge
              colorScheme={dt.Treatment_Stage === "Finished" ? "green" : "orange"}
              borderRadius="md"
              px={2}
            >
              {dt.Treatment_Stage}
            </Badge>
          ) : (
            <Text color="gray.400">--</Text>
          ),
      },
      props: { row: { minW: 100 } },
    },
    {
      headerName: "Teeth",
      key: "Teeth_Count",
      type: "text",
      props: { row: { minW: 70, textAlign: "center" } },
    },
    {
      headerName: "Treatments",
      key: "Treatments",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label={dt.Treatments} hasArrow borderRadius="md" placement="top" maxW="400px">
            <Text
              maxW="180px"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              cursor="pointer"
              fontSize="sm"
            >
              {dt.Treatments || "--"}
            </Text>
          </Tooltip>
        ),
      },
      props: { row: { minW: 200 } },
    },
    {
      headerName: "Prescriptions",
      key: "Prescriptions",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Tooltip label={dt.Prescriptions} hasArrow borderRadius="md" placement="top" maxW="400px">
            <Text
              maxW="180px"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              cursor="pointer"
              fontSize="sm"
            >
              {dt.Prescriptions || "--"}
            </Text>
          </Tooltip>
        ),
      },
      props: { row: { minW: 180 } },
    },
    {
      headerName: "Fee Due (₹)",
      key: "Fee_Due",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text fontWeight="semibold" color="red.500">
            ₹{Number(dt.Fee_Due || 0).toLocaleString("en-IN")}
          </Text>
        ),
      },
      props: { row: { minW: 110, textAlign: "right" } },
    },
    {
      headerName: "Discount (₹)",
      key: "Fee_Discount",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text fontWeight="semibold" color="purple.500">
            ₹{Number(dt.Fee_Discount || 0).toLocaleString("en-IN")}
          </Text>
        ),
      },
      props: { row: { minW: 110, textAlign: "right" } },
    },
    {
      headerName: "Paid (₹)",
      key: "Amount_Paid",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Text fontWeight="semibold" color="green.500">
            ₹{Number(dt.Amount_Paid || 0).toLocaleString("en-IN")}
          </Text>
        ),
      },
      props: { row: { minW: 100, textAlign: "right" } },
    },
    {
      headerName: "Payment Mode",
      key: "Payment_Modes",
      type: "text",
      props: { row: { minW: 120 } },
    },
    {
      headerName: "Work ID",
      key: "Work_ID",
      type: "text",
      props: { row: { minW: 90 } },
    },
  ];

  const filteredRows = rows.filter((r: any) => {
    let matchDate = true;
    if (startDate || endDate) {
      // Work_Date is usually "YYYY-MM-DD"
      if (startDate && r.Work_Date) {
        matchDate = matchDate && r.Work_Date >= startDate;
      }
      if (endDate && r.Work_Date) {
        matchDate = matchDate && r.Work_Date <= endDate;
      }
    }
    const matchDoctor = doctorFilter ? r.Doctor?.toLowerCase().includes(doctorFilter.toLowerCase()) : true;
    return matchDate && matchDoctor;
  });

  const totalPaid = filteredRows.reduce((sum: number, r: any) => sum + (Number(r.Amount_Paid) || 0), 0);
  const rawTotalDue = filteredRows.reduce((sum: number, r: any) => sum + (Number(r.Fee_Due) || 0), 0);
  const totalDiscount = filteredRows.reduce((sum: number, r: any) => sum + (Number(r.Fee_Discount) || 0), 0);
  const totalDue = rawTotalDue - totalDiscount - totalPaid;

  const handlePrint = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const head = [["Work Date", "Doctor", "Treatments", "Fee Due", "Discount", "Paid", "Payment Mode"]];
    const body = filteredRows.map((r: any) => [
      r.Work_Date || "--",
      r.Doctor || "--",
      r.Treatments || "--",
      r.Fee_Due || "0",
      r.Fee_Discount || "0",
      r.Amount_Paid || "0",
      r.Payment_Modes || "--"
    ]);

    doc.setFontSize(16);
    doc.text(`Imported Patient History - ${patient?.name || "Patient"}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Records: ${filteredRows.length} | Total Fee: Rs. ${rawTotalDue.toLocaleString("en-IN")} | Discount: Rs. ${totalDiscount.toLocaleString("en-IN")} | Paid: Rs. ${totalPaid.toLocaleString("en-IN")} | Net Due: Rs. ${totalDue.toLocaleString("en-IN")}`, 14, 22);

    autoTable(doc, {
      head,
      body,
      startY: 28,
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    });

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setPdfBlobUrl(url);
    setIsPreviewOpen(true);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xl" placement="right">
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent maxW="90vw" w="90vw">
        <DrawerHeader bg={headerBg} color="white" py={4}>
          <Flex align="center" justify="space-between" pr={8}>
            <HStack spacing={3}>
              <Icon as={FiDatabase} boxSize={5} />
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Imported Patient History
                </Text>
                <Text fontSize="sm" fontWeight="normal" opacity={0.85}>
                  {patient?.name || "Patient"} &nbsp;|&nbsp; Code: {patient?.code || "--"}
                </Text>
              </Box>
            </HStack>
            <HStack spacing={4}>
              <Box textAlign="center" bg="whiteAlpha.200" px={3} py={2} borderRadius="xl">
                <Text fontSize="xs" opacity={0.8} mb={1}>Records</Text>
                <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="lg">{filteredRows.length}</Badge>
              </Box>
              <Box textAlign="center" bg="whiteAlpha.200" px={3} py={2} borderRadius="xl">
                <Text fontSize="xs" opacity={0.8} mb={1}>Total Fee</Text>
                <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="lg">₹{rawTotalDue.toLocaleString("en-IN")}</Badge>
              </Box>
              <Box textAlign="center" bg="whiteAlpha.200" px={3} py={2} borderRadius="xl">
                <Text fontSize="xs" opacity={0.8} mb={1}>Discount</Text>
                <Badge colorScheme="purple" fontSize="md" px={3} py={1} borderRadius="lg">₹{totalDiscount.toLocaleString("en-IN")}</Badge>
              </Box>
              <Box textAlign="center" bg="whiteAlpha.200" px={3} py={2} borderRadius="xl">
                <Text fontSize="xs" opacity={0.8} mb={1}>Total Paid</Text>
                <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="lg">₹{totalPaid.toLocaleString("en-IN")}</Badge>
              </Box>
              <Box textAlign="center" bg="whiteAlpha.200" px={3} py={2} borderRadius="xl">
                <Text fontSize="xs" opacity={0.8} mb={1}>Net Due</Text>
                <Badge colorScheme="red" fontSize="md" px={3} py={1} borderRadius="lg">₹{totalDue.toLocaleString("en-IN")}</Badge>
              </Box>
            </HStack>
          </Flex>
          <DrawerCloseButton color="white" top={4} />
        </DrawerHeader>

        <DrawerBody bg={bodyBg} p={4}>
          {loading ? (
            <Center h="60vh">
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Center>
          ) : rows.length === 0 ? (
            <Center h="60vh" flexDir="column" gap={3}>
              <Icon as={FiDatabase} boxSize={12} color="gray.300" />
              <Text color="gray.500" fontSize="lg">No imported history found for this patient</Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <HStack mb={4} spacing={4}>
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  size="sm"
                  maxW="150px"
                  bg="white"
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  size="sm"
                  maxW="150px"
                  bg="white"
                />
                <Input
                  placeholder="Filter by Doctor (e.g. Dr. Anant)"
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  size="sm"
                  maxW="250px"
                  bg="white"
                />
                <Button size="sm" colorScheme="blue" leftIcon={<FiPrinter />} onClick={handlePrint}>
                  Print / Download
                </Button>
              </HStack>
              <CustomTable
                title={`Visit History (${filteredRows.length} records)`}
                data={filteredRows}
                columns={columns}
                loading={false}
              />
            </Box>
          )}
        </DrawerBody>
      </DrawerContent>

      <Drawer isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} size="full" placement="right">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent maxW="85%">
          <DrawerHeader bg="blue.600" color="white" borderBottomWidth="1px" py={4}>
            <Text>Report Preview</Text>
          </DrawerHeader>
          <DrawerCloseButton color="white" mt={2} />
          <DrawerBody p={8} display="flex" flexDirection="column" alignItems="center" bg="gray.100">
            {pdfBlobUrl && (
              <Box w="100%" bg="white" borderRadius="xl" overflow="hidden" shadow="2xl" border="1px solid" borderColor="gray.200" flex="1" minH="80vh">
                <iframe src={`${pdfBlobUrl}#toolbar=1&navpanes=0&view=FitH`} width="100%" height="100%" style={{ border: 'none' }} />
              </Box>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Drawer>
  );
});

export default PatientOldDataDrawer;
