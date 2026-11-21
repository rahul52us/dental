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
  useBreakpointValue,
  useColorModeValue,
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
  const isMobile = useBreakpointValue({ base: true, md: false });

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
        theme: "grid",
        headStyles: { fillColor: [30, 58, 138], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', lineColor: [200, 200, 200], lineWidth: 0.1 },
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
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      placement={isMobile ? "bottom" : "right"}
    >
      <DrawerOverlay backdropFilter="blur(4px)" bg="blackAlpha.700" />
      <DrawerContent
        w={{ base: "100%", md: "85%" }}
        maxW={{ base: "100%", md: "85%" }}
        h={{ base: "100dvh", md: "100%" }}
        maxH={{ base: "100dvh", md: "100%" }}
        borderTopRadius={0}
        borderRadius={0}
        borderLeftRadius={{ base: "none", md: "3xl" }}
        bg={useColorModeValue("white", "darkBrand.50")}
        overflow="hidden"
        shadow="2xl"
      >
        <DrawerHeader
          bgGradient="linear(135deg, #091E42 0%, var(--chakra-colors-custom-dark-primary, #0C4A6E) 50%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
          color="white"
          borderBottom="1px solid"
          borderColor={useColorModeValue("whiteAlpha.200", "darkBrand.200")}
          py={{ base: 3.5, md: 4 }}
          px={{ base: 4, md: 8 }}
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="bold"
        >
          <HStack justify="space-between">
            <Text noOfLines={1}>{title}</Text>
          </HStack>
        </DrawerHeader>
        <DrawerCloseButton
          color="white"
          mt={isMobile ? 1 : 2}
          bg="whiteAlpha.200"
          borderRadius="full"
          _hover={{ bg: "whiteAlpha.300" }}
        />

        <DrawerBody
          p={{ base: 2, md: 6 }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          bg={useColorModeValue("gray.50", "darkBrand.50")}
          overflowY="auto"
        >
          {blobUrl ? (
            <Box 
              w="100%" 
              bg={useColorModeValue("white", "darkBrand.100")}
              borderRadius="xl"
              overflow="hidden"
              shadow="xl"
              border="1px solid"
              borderColor={useColorModeValue("gray.200", "darkBrand.200")}
              flex="1"
              minH={{ base: "calc(100dvh - 160px)", md: "80vh" }}
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

        <DrawerFooter
          borderTop="1px solid"
          borderColor={useColorModeValue("gray.200", "darkBrand.200")}
          bg={useColorModeValue("gray.50", "darkBrand.100")}
          p={{ base: 3, md: 4 }}
        >
          <HStack spacing={3} w="full">
            <Button
              variant="outline"
              borderColor={useColorModeValue("gray.300", "whiteAlpha.300")}
              color={useColorModeValue("gray.700", "white")}
              _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
              onClick={onClose}
              borderRadius="xl"
              flex={1}
              minH="44px"
              fontWeight="600"
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              bgGradient="linear(135deg, green.500 0%, teal.600 100%)"
              color="white"
              _hover={{ bgGradient: "linear(135deg, green.600 0%, teal.700 100%)", shadow: "lg" }}
              leftIcon={<Icon as={FiDownload} />}
              onClick={onDownload}
              isLoading={isDownloading}
              loadingText="Downloading..."
              borderRadius="xl"
              flex={{ base: 2, md: "initial" }}
              minH="44px"
              px={{ base: 4, md: 8 }}
              shadow="md"
              fontWeight="700"
            >
              Download Excel
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ReportPreviewDrawer;
