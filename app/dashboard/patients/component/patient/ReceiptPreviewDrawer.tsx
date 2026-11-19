import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Button,
  IconButton,
  Box,
  HStack,
  useToast,
  Text,
  VStack,
  Skeleton,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiDownload, FiFileText, FiX } from 'react-icons/fi';

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
  const isDesktop = useBreakpointValue({ base: false, md: true }) ?? false;

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
      description: "Report has been downloaded to your device.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement={isDesktop ? "right" : "bottom"}
      onClose={onClose}
      size={isDesktop ? undefined : "full"}
    >
      <DrawerOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
      <DrawerContent
        bg="gray.100"
        borderTopRadius={0}
        borderRadius={0}
        borderLeftRadius={isDesktop ? "2xl" : 0}
        shadow="2xl"
        w={isDesktop ? undefined : "100%"}
        minW={isDesktop ? { md: "85vw", lg: "75vw", xl: "85vw" } : "100%"}
        maxH={isDesktop ? "100%" : "100dvh"}
        height={isDesktop ? "100%" : "100dvh"}
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        <DrawerHeader
          px={{ base: 3, md: 6 }}
          py={{ base: 3, md: 5 }}
          bgGradient={isDesktop ? undefined : "linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"}
          bg={isDesktop ? "white" : undefined}
          color={isDesktop ? "gray.800" : "white"}
          borderBottom="1px solid"
          borderColor={isDesktop ? "gray.200" : "transparent"}
          borderTopRadius={0}
          borderRadius={0}
          borderTopLeftRadius={isDesktop ? "2xl" : 0}
        >
          <HStack justify="space-between" align="center" w="100%">
            {/* Left: Icon + Title & File Name */}
            <HStack spacing={2.5} align="center" flex={1} minW={0} overflow="hidden">
              <Box
                p={{ base: 1.5, md: 2 }}
                borderRadius="xl"
                bg={isDesktop ? "teal.50" : "whiteAlpha.200"}
                color={isDesktop ? "teal.600" : "white"}
                flexShrink={0}
              >
                <Icon as={FiFileText} boxSize={{ base: 4, md: 5 }} />
              </Box>
              <VStack align="start" spacing={0} minW={0} flex={1} overflow="hidden">
                <Text
                  fontSize={{ base: "xs", sm: "sm", md: "md" }}
                  fontWeight="800"
                  color={isDesktop ? "gray.800" : "white"}
                  isTruncated
                  maxW="100%"
                >
                  Document Preview
                </Text>
                <Text
                  fontSize="10px"
                  color={isDesktop ? "gray.400" : "teal.100"}
                  isTruncated
                  maxW="100%"
                >
                  {fileName}
                </Text>
              </VStack>
            </HStack>

            {/* Right: Actions */}
            <HStack spacing={1.5} flexShrink={0}>
              <Button
                leftIcon={<FiDownload />}
                color="white"
                bg={isDesktop ? "teal.500" : "whiteAlpha.300"}
                _hover={{ bg: isDesktop ? "teal.600" : "whiteAlpha.400" }}
                _active={{ transform: "scale(0.97)" }}
                size="sm"
                h="34px"
                px={{ base: 2.5, sm: 3.5 }}
                onClick={handleDownload}
                borderRadius="lg"
                fontWeight="700"
                fontSize="xs"
              >
                <Text display={{ base: "none", sm: "inline" }}>Download</Text>
              </Button>

              <IconButton
                aria-label="Close Preview"
                icon={<FiX size={18} />}
                onClick={onClose}
                color={isDesktop ? "gray.600" : "white"}
                bg={isDesktop ? "gray.100" : "whiteAlpha.200"}
                _hover={{ bg: "red.500", color: "white" }}
                _active={{ transform: "scale(0.95)" }}
                borderRadius="full"
                size="sm"
                h="34px"
                w="34px"
                minW="34px"
              />
            </HStack>
          </HStack>
        </DrawerHeader>

        <DrawerBody
          p={{ base: 2, md: 6 }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          bg="gray.100"
          overflowY="auto"
          flex="1"
        >
          {blobUrl ? (
            <Box
              w="100%"
              maxW="full"
              bg="white"
              borderRadius="xl"
              overflow="hidden"
              shadow="md"
              border="1px solid"
              borderColor="gray.200"
              flex="1"
              minH={{ base: "calc(100dvh - 120px)", md: "80vh" }}
            >
              <iframe
                title="Document Preview"
                src={`${blobUrl}#toolbar=1&navpanes=0&view=FitH`}
                width="100%"
                height="100%"
                style={{ border: 'none', minHeight: '100%' }}
              />
            </Box>
          ) : (
            <VStack spacing={4} w="100%" maxW="full" mt={10}>
              <Skeleton h="100px" w="100%" borderRadius="xl" />
              <Skeleton h="500px" w="100%" borderRadius="xl" />
            </VStack>
          )}

          <Text mt={2} mb={2} fontSize="10px" color="gray.400" fontWeight="bold">
            OFFICIAL CLINICAL RECORD
          </Text>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ReceiptPreviewDrawer;
