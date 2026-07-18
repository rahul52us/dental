import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Box,
  HStack,
  useToast,
  Text,
  VStack,
  Skeleton,
  Icon,
} from '@chakra-ui/react';
import { FiDownload, FiFileText, FiPrinter } from 'react-icons/fi';

interface ReceiptPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBase64: string | null;
  fileName: string;
}

const ReceiptPreviewDrawer: React.FC<ReceiptPreviewDrawerProps> = ({
  isOpen,
  onClose,
  pdfBase64,
  fileName,
}) => {
  const toast = useToast();
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (pdfBase64 && isOpen) {
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setBlobUrl(null);
      };
    }
  }, [pdfBase64, isOpen]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = fileName;
    downloadLink.click();
    toast({
      title: "Saved Successfully",
      description: "Receipt has been downloaded to your device.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent
        bg="gray.100"
        borderLeftRadius="2xl"
        shadow="2xl"
        minW={{ base: "100vw", md: "85vw", lg: "75vw", xl: "85vw" }}
      >
        <DrawerCloseButton zIndex={10} />

        <DrawerHeader
          px={6}
          py={5}
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          borderTopLeftRadius="2xl"
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <Text fontSize="md" fontWeight="800" color="gray.700">Receipt Preview</Text>
              <Text fontSize="xs" color="gray.400">{fileName}</Text>
            </VStack>

            <HStack spacing={3} pr={10}>
              <Button
                leftIcon={<FiDownload />}
                colorScheme="emerald"
                size="sm"
                onClick={handleDownload}
                borderRadius="lg"
              >
                Download
              </Button>
            </HStack>
          </HStack>
        </DrawerHeader>

        <DrawerBody p={8} display="flex" flexDirection="column" alignItems="center" bg="gray.100">
          {blobUrl ? (
            <Box
              w="100%"
              maxW="1000px" // Allows A4 reports to look large and clear
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
                title="Receipt Preview"
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

          <Text mt={4} fontSize="10px" color="gray.400" fontWeight="bold">
            OFFICIAL CLINICAL RECORD
          </Text>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ReceiptPreviewDrawer;
