import React, { useMemo, useState, useEffect } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerBody,
  DrawerCloseButton,
  Button,
  Box,
  Text,
  HStack,
  Icon,
  VStack,
  Skeleton,
} from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  columns: any[];
  rows: any[];
  onDownload: () => void;
  isDownloading: boolean;
}

const ReportPreviewDrawer: React.FC<ReportPreviewDrawerProps> = ({
  isOpen,
  onClose,
  title = "Report Preview",
  columns,
  rows,
  onDownload,
  isDownloading,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && columns.length > 0) {
      const doc = new jsPDF({ orientation: "landscape" });
      
      const head = [columns.map((c: any) => c.header)];
      const body = rows.map((r: any) => columns.map((c: any) => {
        const val = r[c.key];
        if (val === null || val === undefined) return "-";
        return String(val);
      }));

      doc.setFontSize(16);
      doc.text(title || "Report Preview", 14, 15);
      
      autoTable(doc, {
        head,
        body,
        startY: 20,
        theme: "striped",
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      });

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setBlobUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setBlobUrl(null);
      };
    }
  }, [isOpen, columns, rows, title]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="full" placement="right">
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent maxW="85%">
        <DrawerHeader bg="blue.600" color="white" borderBottomWidth="1px" py={4}>
          <HStack justify="space-between">
            <Text>{title}</Text>
          </HStack>
        </DrawerHeader>
        <DrawerCloseButton color="white" mt={2} />

        <DrawerBody p={8} display="flex" flexDirection="column" alignItems="center" bg="gray.100">
          {blobUrl ? (
            <Box 
              w="100%" 
              bg="white"
              borderRadius="xl"
              overflow="hidden"
              shadow="2xl"
              border="1px solid"
              borderColor="gray.200"
              flex="1"
              minH="80vh"
            >
              <iframe
                title="Report PDF Preview"
                src={`${blobUrl}#toolbar=1&navpanes=0&view=FitH`}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </Box>
          ) : (
            <VStack spacing={4} w="100%" maxW="1000px" mt={10}>
              <Skeleton h="100px" w="100%" borderRadius="xl" />
              <Skeleton h="500px" w="100%" borderRadius="xl" />
            </VStack>
          )}
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" bg="white">
          <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={FiDownload} />}
            onClick={onDownload}
            isLoading={isDownloading}
            loadingText="Downloading..."
            borderRadius="xl"
            px={8}
            shadow="md"
          >
            Download Excel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ReportPreviewDrawer;
