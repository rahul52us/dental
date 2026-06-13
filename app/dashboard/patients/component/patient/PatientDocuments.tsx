"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  SimpleGrid,
  Image,
  Badge,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Select,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tooltip,
  useDisclosure,
  Icon,
  Flex,
  Progress,
  Link,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiTrash2,
  FiImage,
  FiVideo,
  FiFileText,
  FiLink,
  FiExternalLink,
  FiUpload,
  FiFolder,
  FiX,
} from "react-icons/fi";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import { readFileAsBase64 } from "../../../../config/utils/utils";

interface PatientDocumentsProps {
  patientDetails: any;
}

const TYPE_META: Record<string, { icon: any; color: string; label: string }> = {
  image:    { icon: FiImage,    color: "blue",   label: "Image"    },
  video:    { icon: FiVideo,    color: "purple", label: "Video"    },
  document: { icon: FiFileText, color: "orange", label: "Document" },
  other:    { icon: FiLink,     color: "gray",   label: "Other"    },
};

const PatientDocuments = observer(({ patientDetails }: PatientDocumentsProps) => {
  const {
    userStore: { getPatientDocuments, addPatientDocument, deletePatientDocument },
    auth: { uploadFile, openNotification },
  } = stores;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal form state
  const [tabIndex, setTabIndex] = useState(0); // 0 = Upload Image, 1 = Add Link
  const [form, setForm] = useState({
    title: "",
    type: "other",
    url: "",
  });
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const fetchDocs = async () => {
    if (!patientDetails?._id) return;
    setLoading(true);
    try {
      const data = await getPatientDocuments(patientDetails._id);
      setDocuments(data || []);
    } catch {
      openNotification({ type: "error", title: "Error", message: "Failed to load documents" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientDetails?._id]);

  const resetForm = () => {
    setForm({ title: "", type: "other", url: "" });
    setPreviewFile(null);
    setPreviewUrl("");
    setUploadProgress(0);
  };

  const handleClose = () => {
    resetForm();
    setTabIndex(0);
    onClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (!form.title) {
      setForm((f) => ({ ...f, title: file.name.replace(/\.[^/.]+$/, ""), type: "image" }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (!form.title) {
      setForm((f) => ({ ...f, title: file.name.replace(/\.[^/.]+$/, ""), type: "image" }));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      return openNotification({ type: "error", title: "Validation", message: "Title is required" });
    }

    setSaving(true);
    try {
      let finalUrl = form.url;

      // ── Image Upload tab ──
      if (tabIndex === 0) {
        if (!previewFile) {
          return openNotification({ type: "error", title: "Validation", message: "Please select an image" });
        }
        setUploading(true);
        setUploadProgress(30);
        const buffer = await readFileAsBase64(previewFile);
        setUploadProgress(60);
        // Backend expects: { file: { buffer, filename, type } }
        const uploadResult = await uploadFile({
          file: {
            buffer,
            filename: previewFile.name,
            type: previewFile.type,
          },
        });
        setUploadProgress(100);
        setUploading(false);
        // Backend returns URL as: response.data (a string URL directly)
        finalUrl = uploadResult?.data || uploadResult?.url || uploadResult;
        if (!finalUrl || typeof finalUrl !== "string") {
          throw new Error("Upload failed — no URL returned from Cloudinary");
        }
      } else {
        // ── Link tab ──
        if (!form.url.trim()) {
          return openNotification({ type: "error", title: "Validation", message: "URL is required" });
        }
      }

      await addPatientDocument({
        patient: patientDetails._id,
        title: form.title.trim(),
        type: tabIndex === 0 ? "image" : form.type,
        url: finalUrl,
      });

      openNotification({ type: "success", title: "Saved", message: "Document added successfully" });
      handleClose();
      fetchDocs();
    } catch (err: any) {
      openNotification({ type: "error", title: "Error", message: err?.message || "Failed to save" });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      await deletePatientDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      openNotification({ type: "success", title: "Deleted", message: "Document removed" });
    } catch {
      openNotification({ type: "error", title: "Error", message: "Failed to delete document" });
    } finally {
      setDeleteId(null);
    }
  };

  const imageItems = documents.filter((d) => d.type === "image");
  const otherItems = documents.filter((d) => d.type !== "image");

  return (
    <Box p={4}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={5}>
        <VStack align="start" spacing={0}>
          <Text fontSize="lg" fontWeight="extrabold" color="gray.800">
            Documents & Media
          </Text>
          <Text fontSize="xs" color="gray.500">
            {patientDetails?.name} · {documents.length} item{documents.length !== 1 ? "s" : ""}
          </Text>
        </VStack>
        {stores.auth.hasPermission('patient_documents', 'create') && (
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            borderRadius="full"
            size="sm"
            fontWeight="bold"
            onClick={onOpen}
            shadow="md"
          >
            Add Media
          </Button>
        )}
      </Flex>

      {/* Content */}
      {loading ? (
        <Center py={16}>
          <VStack>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color="gray.500" fontSize="sm">Loading documents...</Text>
          </VStack>
        </Center>
      ) : documents.length === 0 ? (
        <Center py={16}>
          <VStack spacing={3}>
            <Icon as={FiFolder} fontSize="50px" color="gray.300" />
            <Text fontWeight="bold" color="gray.400">No documents yet</Text>
            <Text fontSize="sm" color="gray.400">Click "Add Media" to upload images or add links</Text>
          </VStack>
        </Center>
      ) : (
        <VStack align="stretch" spacing={6}>
          {/* Images Grid */}
          {imageItems.length > 0 && (
            <Box>
              <HStack mb={3}>
                <Icon as={FiImage} color="blue.500" />
                <Text fontWeight="bold" fontSize="sm" color="gray.700">
                  IMAGES ({imageItems.length})
                </Text>
              </HStack>
              <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={3}>
                {imageItems.map((doc) => (
                  <Box
                    key={doc._id}
                    position="relative"
                    borderRadius="xl"
                    overflow="hidden"
                    border="2px solid"
                    borderColor="gray.100"
                    shadow="sm"
                    _hover={{ shadow: "lg", borderColor: "blue.300" }}
                    transition="all 0.2s"
                  >
                    <Image
                      src={doc.url}
                      alt={doc.title}
                      w="100%"
                      h="120px"
                      objectFit="cover"
                      fallback={
                        <Center h="120px" bg="gray.100">
                          <Icon as={FiImage} color="gray.400" fontSize="28px" />
                        </Center>
                      }
                    />
                    {/* Overlay */}
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      bg="blackAlpha.700"
                      px={2}
                      py={1.5}
                    >
                      <Text fontSize="10px" color="white" fontWeight="bold" noOfLines={1}>
                        {doc.title}
                      </Text>
                    </Box>
                    {/* Actions */}
                    <HStack
                      position="absolute"
                      top={1}
                      right={1}
                      spacing={1}
                    >
                      <Tooltip label="Open">
                        <IconButton
                          as={Link}
                          href={doc.url}
                          isExternal
                          icon={<FiExternalLink />}
                          size="xs"
                          colorScheme="blue"
                          borderRadius="full"
                          aria-label="Open"
                        />
                      </Tooltip>
                      {stores.auth.hasPermission('patient_documents', 'delete') && (
                        <Tooltip label="Delete">
                          <IconButton
                            icon={deleteId === doc._id ? <Spinner size="xs" /> : <FiTrash2 />}
                            size="xs"
                            colorScheme="red"
                            borderRadius="full"
                            aria-label="Delete"
                            isLoading={deleteId === doc._id}
                            onClick={() => handleDelete(doc._id)}
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Other Files List */}
          {otherItems.length > 0 && (
            <Box>
              <HStack mb={3}>
                <Icon as={FiLink} color="orange.500" />
                <Text fontWeight="bold" fontSize="sm" color="gray.700">
                  LINKS & FILES ({otherItems.length})
                </Text>
              </HStack>
              <VStack align="stretch" spacing={2}>
                {otherItems.map((doc) => {
                  const meta = TYPE_META[doc.type] || TYPE_META.other;
                  return (
                    <Box
                      key={doc._id}
                      p={3}
                      borderRadius="xl"
                      border="1.5px solid"
                      borderColor="gray.100"
                      bg="white"
                      shadow="sm"
                      _hover={{ shadow: "md", borderColor: `${meta.color}.300` }}
                      transition="all 0.2s"
                    >
                      <HStack justify="space-between">
                        <HStack spacing={3} flex={1} minW={0}>
                          <Flex
                            w="38px"
                            h="38px"
                            borderRadius="lg"
                            bg={`${meta.color}.50`}
                            align="center"
                            justify="center"
                            flexShrink={0}
                          >
                            <Icon as={meta.icon} color={`${meta.color}.500`} fontSize="16px" />
                          </Flex>
                          <VStack align="start" spacing={0} flex={1} minW={0}>
                            <Text fontWeight="bold" fontSize="sm" noOfLines={1} color="gray.800">
                              {doc.title}
                            </Text>
                            <Link
                              href={doc.url}
                              isExternal
                              fontSize="11px"
                              color="blue.500"
                              noOfLines={1}
                              maxW="300px"
                            >
                              {doc.url}
                            </Link>
                          </VStack>
                        </HStack>
                        <HStack spacing={1} flexShrink={0}>
                          <Badge colorScheme={meta.color} borderRadius="full" fontSize="9px" px={2}>
                            {meta.label}
                          </Badge>
                          <Tooltip label="Open link">
                            <IconButton
                              as={Link}
                              href={doc.url}
                              isExternal
                              icon={<FiExternalLink />}
                              size="xs"
                              variant="ghost"
                              colorScheme="blue"
                              aria-label="Open"
                            />
                          </Tooltip>
                          {stores.auth.hasPermission('patient_documents', 'delete') && (
                            <Tooltip label="Delete">
                              <IconButton
                                icon={deleteId === doc._id ? <Spinner size="xs" /> : <FiTrash2 />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                aria-label="Delete"
                                isLoading={deleteId === doc._id}
                                onClick={() => handleDelete(doc._id)}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          )}
        </VStack>
      )}

      {/* Add Media Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalHeader
            bg="blue.600"
            color="white"
            py={4}
            px={6}
            fontSize="md"
            fontWeight="bold"
          >
            <HStack>
              <Icon as={FiPlus} />
              <Text>Add Document / Media</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" mt={1} />

          <ModalBody p={6}>
            <Tabs
              index={tabIndex}
              onChange={(i) => { setTabIndex(i); resetForm(); }}
              colorScheme="blue"
              variant="soft-rounded"
              mb={4}
            >
              <TabList bg="gray.50" borderRadius="full" p={1} mb={5}>
                <Tab borderRadius="full" fontSize="sm" fontWeight="bold" flex={1}>
                  <HStack spacing={2}>
                    <FiUpload />
                    <Text>Upload Image</Text>
                  </HStack>
                </Tab>
                <Tab borderRadius="full" fontSize="sm" fontWeight="bold" flex={1}>
                  <HStack spacing={2}>
                    <FiLink />
                    <Text>Add Link</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* ── Tab 0: Upload Image ── */}
                <TabPanel p={0}>
                  <VStack spacing={4}>
                    {/* Drop Zone */}
                    <Box
                      w="100%"
                      h={previewUrl ? "auto" : "160px"}
                      border="2px dashed"
                      borderColor={previewUrl ? "blue.300" : "gray.300"}
                      borderRadius="xl"
                      bg={previewUrl ? "blue.50" : "gray.50"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      overflow="hidden"
                      position="relative"
                    >
                      {previewUrl ? (
                        <>
                          <Image
                            src={previewUrl}
                            alt="preview"
                            maxH="200px"
                            objectFit="contain"
                            borderRadius="lg"
                          />
                          <IconButton
                            icon={<FiX />}
                            size="xs"
                            colorScheme="red"
                            borderRadius="full"
                            position="absolute"
                            top={2}
                            right={2}
                            aria-label="Remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile(null);
                              setPreviewUrl("");
                            }}
                          />
                        </>
                      ) : (
                        <VStack spacing={2} color="gray.500">
                          <Icon as={FiUpload} fontSize="30px" />
                          <Text fontWeight="bold" fontSize="sm">Drag & drop or click to upload</Text>
                          <Text fontSize="xs">PNG, JPG, JPEG, WEBP</Text>
                        </VStack>
                      )}
                    </Box>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileSelect}
                    />
                    {uploading && (
                      <Box w="100%">
                        <Text fontSize="xs" color="blue.600" mb={1} fontWeight="bold">
                          Uploading to Cloudinary...
                        </Text>
                        <Progress value={uploadProgress} colorScheme="blue" borderRadius="full" size="sm" />
                      </Box>
                    )}
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">Title</FormLabel>
                      <Input
                        placeholder="e.g. X-Ray Front View"
                        borderRadius="lg"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>

                {/* ── Tab 1: Add Link ── */}
                <TabPanel p={0}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">Title</FormLabel>
                      <Input
                        placeholder="e.g. MRI Scan Report"
                        borderRadius="lg"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">URL / Link</FormLabel>
                      <Input
                        placeholder="https://drive.google.com/..."
                        borderRadius="lg"
                        value={form.url}
                        onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">Type</FormLabel>
                      <Select
                        borderRadius="lg"
                        value={form.type}
                        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      >
                        <option value="video">📹 Video (MP4, YouTube, etc.)</option>
                        <option value="document">📄 Document (PDF, DOC, etc.)</option>
                        <option value="other">🔗 Other Link</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.100" bg="gray.50" gap={3}>
            <Button variant="ghost" borderRadius="full" onClick={handleClose} size="sm">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              borderRadius="full"
              size="sm"
              fontWeight="bold"
              isLoading={saving}
              loadingText={uploading ? "Uploading..." : "Saving..."}
              onClick={handleSave}
              px={6}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default PatientDocuments;
