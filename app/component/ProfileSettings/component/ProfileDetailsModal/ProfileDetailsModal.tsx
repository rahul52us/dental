import {
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  InfoIcon,
} from "@chakra-ui/icons"; // Assuming standard chakra icons
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";
import stores from "../../../../store/stores";
import { getDefaultSchedule } from "../../utils/constant";
import OperatingHours from "../OperatingHours/OperatingHours";
import ProfileSettings from "../../ProfileSettings"; // Adjust path if needed
import ThemeSettings from "../ThemeSettings/ThemeSettings";

// Helper component for consistent key-value display
const DetailItem = ({ label, value, icon }) => (
  <Box p={3} borderWidth="1px" borderRadius="lg" bg="gray.50">
    <Flex align="center" mb={1}>
      {icon && <Icon as={icon} color="blue.500" mr={2} boxSize={3} />}
      <Text
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        color="gray.500"
      >
        {label}
      </Text>
    </Flex>
    <Text fontSize="md" fontWeight="medium" color="gray.700">
      {value || "-"}
    </Text>
  </Box>
);

const ProfileDetailsModal = observer(({ user }: any) => {
  const [schedule, setSchedule] = useState(
    user?.companyDetails?.operatingHours?.length > 0
      ? user.companyDetails.operatingHours
      : getDefaultSchedule()
  );
  const [isSaving, setIsSaving] = useState(false);
  const { themeStore, companyStore } = stores;
  const { profileModal, setProfileModal } = themeStore;
  const toast = useToast();

  const handleClose = () => {
    setProfileModal(false, 0);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // We no longer need to fetch company details separately since it's populated in the me API
  const companyLogo = user?.companyDetails?.logo || user?.companyDetail?.logo;

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const buffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadResult = await stores.auth.uploadFile({
        file: {
          buffer: buffer,
          filename: file.name,
          type: file.type,
        },
        folder: "company-logos",
      });
      const newUrl = uploadResult?.data || uploadResult?.url || uploadResult;

      // Update in backend using the new API
      await stores.companyStore.updateCompanyLogo({
        logoUrl: newUrl,
      });

      // Refresh user details (me API) to reflect new logo instantly
      await stores.auth.fetchUser();

      toast({
        title: "Success",
        description: "Company logo updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error?.message || error || "Failed to update company logo.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const buffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadResult = await stores.auth.uploadFile({
        file: {
          buffer: buffer,
          filename: file.name,
          type: file.type,
        },
        folder: "profiles",
      });
      const newUrl = uploadResult?.data || uploadResult?.url || uploadResult;

      if (!newUrl || typeof newUrl !== "string") throw new Error("Upload failed");

      // Update in backend
      await stores.userStore.updateUser({
        ...user,
        pic: { url: newUrl },
      });

      // Update in mobx store immediately
      if (stores.auth.user) {
        stores.auth.user.pic = { url: newUrl };
      }

      toast({
        title: "Profile Picture Updated",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err?.message || "Could not upload image.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = schedule.map((item) => ({
      day: item.day,
      isOpen: item.isOpen,
      slots: item.isOpen ? item.slots.filter((s) => s.start && s.end) : [],
    }));

    try {
      const response = await companyStore.updateOperatingHours({
        operatingHours: payload,
        sidebarColors: stores.themeStore.themeConfig.sidebarColors,
      });

      if (response?.data?.success) {
        toast({
          title: "Configuration Saved",
          description: "Operating hours updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        handleClose();
      }
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err?.message || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSaving(false);
    }
  };
  // Safety check if user is null
  if (!user) return null;
  const {
    name,
    title,
    username,
    role,
    pic,
    code,
    is_active,
    companyDetails,
    createdAt,
  } = user;

  const joinedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-IN') : "-";

  return (
    <Modal
      isOpen={profileModal.isOpen}
      onClose={handleClose}
      size={"3xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        {/* Header Section: Identity */}
        <Box bg="blue.600" p={5} color="white" position="relative">
          <ModalCloseButton color="white" onClick={handleClose} />
          <Flex
            direction={{ base: "column", sm: "row" }}
            align="center"
            gap={5}
          >
            <Box position="relative" cursor="pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar
                size="lg"
                src={pic?.url}
                name={name}
                border="4px solid white"
                boxShadow="lg"
                opacity={uploadingImage ? 0.5 : 1}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
              <Flex
                position="absolute"
                bottom={-1}
                right={-1}
                bg="blue.500"
                color="white"
                borderRadius="full"
                w={6}
                h={6}
                align="center"
                justify="center"
                boxShadow="sm"
                border="2px solid white"
                _hover={{ bg: "blue.600" }}
              >
                {uploadingImage ? (
                  <Icon as={CheckCircleIcon} opacity={0} boxSize={3} />
                ) : (
                  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" boxSize={3}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </Icon>
                )}
              </Flex>
            </Box>
            <Box textAlign={{ base: "center", sm: "left" }}>
              <Flex
                align="center"
                gap={2}
                justify={{ base: "center", sm: "flex-start" }}
              >
                <Heading size="md">
                  {title} {name}
                </Heading>
                <Badge
                  colorScheme={is_active ? "green" : "red"}
                  variant="solid"
                  borderRadius="full"
                  px={2}
                >
                  {is_active ? "Active" : "Inactive"}
                </Badge>
              </Flex>
              <Text fontSize="md" opacity={0.9} mt={1}>
                {username}
              </Text>
              <Badge mt={2} colorScheme="orange" variant="subtle">
                {role}
              </Badge>
            </Box>
          </Flex>
        </Box>

        <ModalBody p={0}>
          <Tabs isFitted variant="enclosed" colorScheme="blue" index={profileModal.defaultTab} onChange={(index) => setProfileModal(true, index)}>
            <TabList px={4} pt={4}>
              <Tab fontWeight="bold">Profile</Tab>
              <Tab fontWeight="bold">Operating Hours</Tab>
              <Tab fontWeight="bold">Sidebar</Tab>
              <Tab fontWeight="bold">Theme</Tab>
            </TabList>

            <TabPanels>
              {/* TAB 1: Profile Overview */}
              <TabPanel p={6}>
                <VStack spacing={6} align="stretch">
                  <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
                    <Flex align="center" justify="space-between">
                      <HStack spacing={4}>
                        <Avatar size="md" src={pic?.url} name={name} />
                        <Box>
                          <Text fontWeight="bold">Profile Picture</Text>
                          <Text fontSize="sm" color="gray.500">Upload a new avatar to personalize your account</Text>
                        </Box>
                      </HStack>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<Icon as={FiUpload} />}
                        onClick={() => fileInputRef.current?.click()}
                        isLoading={uploadingImage}
                      >
                        Update Photo
                      </Button>
                    </Flex>
                  </Box>

                  {user?.role === "admin" && (
                    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
                      <Flex align="center" justify="space-between">
                        <HStack spacing={4}>
                          <Avatar size="md" src={companyLogo?.url} name={user?.companyDetail?.company_name} borderRadius="md" />
                          <Box>
                            <Text fontWeight="bold">Company Logo</Text>
                            <Text fontSize="sm" color="gray.500">Update the logo for your clinic/company</Text>
                          </Box>
                        </HStack>
                        <Button
                          size="sm"
                          colorScheme="teal"
                          leftIcon={<Icon as={FiUpload} />}
                          onClick={() => logoInputRef.current?.click()}
                          isLoading={uploadingLogo}
                        >
                          Update Logo
                        </Button>
                        <input
                          type="file"
                          ref={logoInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          style={{ display: "none" }}
                        />
                      </Flex>
                    </Box>
                  )}

                  <Divider />
                  {/* Details Grid */}
                  <Box>
                    <Text fontWeight="bold" mb={3}>
                      Account & Company Details
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <DetailItem
                        label="Employee Code"
                        value={code}
                        icon={InfoIcon}
                      />
                      <DetailItem
                        label="Company"
                        value={companyDetails?.company_name}
                        icon={CheckCircleIcon}
                      />
                      <DetailItem
                        label="User Type"
                        value={user.userType}
                        icon={InfoIcon}
                      />
                      <DetailItem
                        label="Joined On"
                        value={joinedDate}
                        icon={CalendarIcon}
                      />
                    </SimpleGrid>
                  </Box>
                </VStack>
              </TabPanel>

              {/* TAB 2: Operating Hours (Placeholder) */}
              <TabPanel p={6}>
                <OperatingHours schedule={schedule} setSchedule={setSchedule} />
              </TabPanel>

              <TabPanel p={6}>
                <ProfileSettings />
              </TabPanel>

              {/* TAB 4: Theme Settings */}
              <TabPanel p={0}>
                <ThemeSettings />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter bg="gray.50">
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Close
          </Button>

          <Button
            colorScheme="blue"
            leftIcon={<CheckIcon />}
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default ProfileDetailsModal;
