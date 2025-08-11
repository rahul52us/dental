"use client";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  Image,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useState, useRef } from "react";
import { MdEdit } from "react-icons/md";
import { CloseIcon, WarningIcon } from "@chakra-ui/icons";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import RichTextEditor from "../../../../component/common/Editor/RichQuillEditor";
import FormModel from "../../../../component/common/FormModel/FormModel";

const BlogForm = observer(({ initialValues, submitForm, loading }: any) => {
  const [formState, setFormState] = useState<any>(initialValues);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tempSubtitle, setTempSubtitle] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const handleStateChange = (key: string, value: any) => {
    if (key === "coverImage") {
      setFormState((prev: any) => ({
        ...prev,
        [key]: { ...prev[key], ...value },
      }));
    } else {
      setFormState((prev: any) => ({ ...prev, [key]: value }));
    }
  };

  const handleTagAdd = () => {
    const { tagInput, tags } = formState;
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      handleStateChange("tags", [...tags, tagInput.trim()]);
      handleStateChange("tagInput", "");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleStateChange("tags", formState.tags.filter((tag: any) => tag !== tagToRemove));
  };

  const sendDataToBackend = () => {
    const { title, content, subTitle, tags, coverImage, isPrivate, slug, category, target } = formState;
    if (!title || !content) {
      toast({
        title: "Validation Error",
        description: "Title and content cannot be empty.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    submitForm({ title, content, subTitle, tags, coverImage, isPrivate, slug, category, target });
  };

  const handleModalSubmit = () => {
    handleStateChange("subTitle", tempSubtitle);
    onClose();
  };

  const handleReset = () => {
    setFormState({
      isPreviewMode: false,
      title: "",
      subTitle: "",
      content: "",
      slug:"",
      category:undefined,
      tags: [],
      target:undefined,
      tagInput: "",
      isLoading: false,
      coverImage: { filename: null, type: null, buffer: null, isAdd: 0, isDeleted: 1 },
    });
    setIsResetModalOpen(false);
  };

  const { isPreviewMode, title, subTitle, content, tags, tagInput } = formState;

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg="white"
      borderRadius="xl"
      boxShadow="md"
      minH="80vh"
      position="relative"
    >
      {/* Main Layout */}
      <Grid
        templateColumns={{ base: "1fr", md: "7fr 3fr" }} // Adjusted ratio for balance
        gap={{ base: 4, md: 6 }}
        alignItems="start"
      >
        {/* Left Column - Editor */}
        <Box>
          <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
            <Heading fontSize={{ base: "lg", md: "xl" }} color="gray.800" fontWeight="medium">
              {isPreviewMode ? "Preview" : "Editor"}
            </Heading>
            <Flex gap={3} align="center">
              <CustomInput
                type="switch"
                name="isPrivate"
                label="Private"
                value={formState.isPrivate}
                onChange={(e) => handleStateChange("isPrivate", e?.target?.checked)}
              />
              <Button
                size="sm"
                bg={isPreviewMode ? "purple.500" : "teal.500"}
                color="white"
                _hover={{ bg: isPreviewMode ? "purple.600" : "teal.600" }}
                onClick={() => handleStateChange("isPreviewMode", !isPreviewMode)}
                borderRadius="md"
                px={4}
              >
                {isPreviewMode ? "Edit" : "Preview"}
              </Button>
            </Flex>
          </Flex>

          {isPreviewMode ? (
            <Box
              p={4}
              bg="gray.50"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
              boxShadow="sm"
            >
              <Heading as="h1" size="lg" mb={3} color="gray.800" fontWeight="semibold">
                {title || "Untitled Blog"}
              </Heading>
              <Text fontSize="md" color="gray.600" mb={4} lineHeight="tall">
                <Box dangerouslySetInnerHTML={{ __html: subTitle }} />
              </Text>
              <Box color="gray.700" fontSize="md" dangerouslySetInnerHTML={{ __html: content }} />
              <Text mt={4} fontSize="sm" color="gray.500">
                Tags: {tags.length ? tags.join(", ") : "None"}
              </Text>
            </Box>
          ) : (
            <VStack align="stretch" spacing={4}>
              <Flex align="center" gap={3} flexWrap="wrap">
                <Input
                  placeholder="Blog Title"
                  value={title}
                  onChange={(e) => handleStateChange("title", e.target.value)}
                  size="md"
                  borderColor="gray.300"
                  focusBorderColor="teal.500"
                  borderRadius="md"
                  fontSize="lg"
                  py={6}
                  flex={1}
                />
                <Button
                  colorScheme="teal"
                  variant="outline"
                  size="md"
                  leftIcon={<Icon as={MdEdit} />}
                  onClick={() => {
                    setTempSubtitle(subTitle);
                    onOpen();
                  }}
                  borderRadius="md"
                  _hover={{ bg: "teal.50" }}
                >
                  Edit Details
                </Button>
              </Flex>
              <RichTextEditor
                setEditorHtml={(html: string) => handleStateChange("content", html)}
                height="60vh"
                editorHtml={content}
              />
            </VStack>
          )}
        </Box>

        {/* Right Column - Writing Tips */}
        <Box
          p={4}
          bg="teal.50"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="teal.100"
          position={{ md: "sticky" }}
          top={6}
          alignSelf="start"
          boxShadow="sm"
        >
          <Heading fontSize="md" mb={3} color="teal.800" fontWeight="semibold">
            Writing Tips
          </Heading>
          <VStack align="start" spacing={3} fontSize="sm" color="teal.700">
            <Text>✍️ Use catchy titles to grab attention.</Text>
            <Text>✍️ Keep paragraphs short and focused.</Text>
            <Text>✍️ Add headings and bullets for clarity.</Text>
          </VStack>
          <Flex
        width="100%"
        gap={3}
        mt={6}
        p={4}
        bg="gray.50"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="sm"
      >
        <Button
          variant="outline"
          colorScheme="gray"
          size="md"
          borderRadius="md"
          onClick={() => setIsResetModalOpen(true)}
          _hover={{ bg: "gray.100" }}
          px={6}
        >
          Reset
        </Button>
        <Button
          colorScheme="teal"
          size="md"
          borderRadius="md"
          isLoading={loading}
          onClick={sendDataToBackend}
          _hover={{ bg: "teal.600" }}
          px={6}
        >
          Publish
        </Button>
      </Flex>
        </Box>

      </Grid>

      {/* Footer Action Buttons */}

      {/* Edit Modal */}
      <FormModel open={isOpen} close={onClose} isCentered title="Edit Blog Details" size="xl">
        <Tabs variant="soft-rounded" colorScheme="teal">
          <TabList mb={4} bg="gray.50" p={2} borderRadius="md">
            <Tab fontWeight="medium" fontSize="sm">Subtitle</Tab>
            <Tab fontWeight="medium" fontSize="sm">Tags</Tab>
            <Tab fontWeight="medium" fontSize="sm">Cover Image</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <RichTextEditor
                  setEditorHtml={setTempSubtitle}
                  editorHtml={tempSubtitle}
                  height="200px"
                />
                <Box
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                  maxH="200px"
                  overflowY="auto"
                  fontSize="sm"
                  color="gray.700"
                  dangerouslySetInnerHTML={{ __html: tempSubtitle }}
                />
                <Flex justify="flex-end" gap={3}>
                  <Button
                    colorScheme="teal"
                    size="md"
                    borderRadius="md"
                    onClick={handleModalSubmit}
                    px={6}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    size="md"
                    borderRadius="md"
                    onClick={onClose}
                    px={6}
                  >
                    Cancel
                  </Button>
                </Flex>
              </VStack>
            </TabPanel>
            <TabPanel>
  <VStack align="stretch" spacing={3}>
    {/* Slug Input */}
    <Text fontWeight="medium" fontSize="sm" color="gray.700">
      Slug
    </Text>
    <Input
      placeholder="Enter slug..."
      value={formState.slug}
      onChange={(e) => handleStateChange("slug", e.target.value)}
      size="md"
      borderColor="gray.300"
      focusBorderColor="teal.500"
      borderRadius="md"
    />

    {/* Category Input */}
    <Text fontWeight="medium" fontSize="sm" color="gray.700">
      Category
    </Text>
    <Input
      placeholder="Enter category..."
      value={formState.category}
      onChange={(e) => handleStateChange("category", e.target.value)}
      size="md"
      borderColor="gray.300"
      focusBorderColor="teal.500"
      borderRadius="md"
    />

<Text fontWeight="medium" fontSize="sm" color="gray.700">
      Target
    </Text>
    <Input
      placeholder="Enter Target..."
      value={formState.target}
      onChange={(e) => handleStateChange("target", e.target.value)}
      size="md"
      borderColor="gray.300"
      focusBorderColor="teal.500"
      borderRadius="md"
    />

    {/* Tags Input */}
    <Text fontWeight="medium" fontSize="sm" color="gray.700">
      Tags
    </Text>
    <Flex gap={2} wrap="wrap">
      {tags.map((tag: any) => (
        <Tag key={tag} size="md" colorScheme="teal" borderRadius="full" px={3}>
          <TagLabel>{tag}</TagLabel>
          <TagCloseButton onClick={() => handleTagRemove(tag)} />
        </Tag>
      ))}
    </Flex>
    <Flex gap={2}>
      <Input
        ref={tagInputRef}
        placeholder="Add a tag..."
        value={tagInput}
        onChange={(e) => handleStateChange("tagInput", e.target.value)}
        size="md"
        borderColor="gray.300"
        focusBorderColor="teal.500"
        borderRadius="md"
      />
      <Button size="md" colorScheme="teal" onClick={handleTagAdd} borderRadius="md" px={4}>
        Add
      </Button>
    </Flex>
  </VStack>
</TabPanel>

            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        handleStateChange("coverImage", {
                          filename: file.name,
                          buffer: reader.result,
                          type: file.type,
                          isAdd: 1,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  size="md"
                  borderColor="gray.300"
                  borderRadius="md"
                />
                {formState.coverImage?.buffer && (
                  <Box>
                    <Text fontSize="sm" mb={2} color="gray.600">
                      Preview:
                    </Text>
                    <Box
                      borderRadius="md"
                      overflow="hidden"
                      borderWidth="1px"
                      borderColor="gray.200"
                      boxShadow="sm"
                    >
                      <Image
                        src={formState.coverImage.buffer}
                        alt={formState.coverImage.filename || ""}
                        style={{ width: "100%", height: "auto" }}
                      />
                    </Box>
                    <Button
                      size="sm"
                      mt={3}
                      colorScheme="red"
                      variant="outline"
                      borderRadius="md"
                      onClick={() =>
                        handleStateChange("coverImage", {
                          name: null,
                          buffer: null,
                          type: null,
                          isDeleted: 1,
                        })
                      }
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FormModel>

      {/* Reset Modal */}
      <FormModel
        open={isResetModalOpen}
        close={() => setIsResetModalOpen(false)}
        isCentered
        title="Confirm Reset"
        size="md"
      >
        <Box p={6} textAlign="center">
          <WarningIcon color="red.500" boxSize={8} mb={4} />
          <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb={2}>
            Reset Form?
          </Text>
          <Text fontSize="sm" color="gray.600" mb={6}>
            All unsaved changes will be lost. This cannot be undone.
          </Text>
          <Flex justify="center" gap={4}>
            <Button
              colorScheme="red"
              size="md"
              borderRadius="md"
              onClick={handleReset}
              leftIcon={<WarningIcon />}
              _hover={{ bg: "red.600" }}
              px={6}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              colorScheme="gray"
              size="md"
              borderRadius="md"
              onClick={() => setIsResetModalOpen(false)}
              leftIcon={<CloseIcon />}
              px={6}
            >
              Cancel
            </Button>
          </Flex>
        </Box>
      </FormModel>
    </Box>
  );
});

export default BlogForm;