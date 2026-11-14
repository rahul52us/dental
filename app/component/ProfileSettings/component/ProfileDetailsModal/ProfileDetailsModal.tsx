import {
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  InfoIcon,
  DownloadIcon
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
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
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
  Input,
  Image,
  Select,
  Textarea
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import { observer } from "mobx-react-lite";
import { useState, useRef, useEffect } from "react";
import stores from "../../../../store/stores";
import { getDefaultSchedule } from "../../utils/constant";
import OperatingHours from "../OperatingHours/OperatingHours";
import ProfileSettings from "../../ProfileSettings"; // Adjust path if needed
import ThemeSettings from "../ThemeSettings/ThemeSettings";
import WhatsappSettings from './WhatsappSettings';

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
  const { globalConfigStore, themeStore, userStore, companyStore } = stores;
  const { profileModal, setProfileModal } = themeStore;
  const toast = useToast();

  const [isExporting, setIsExporting] = useState(false);

  const handleExportDatabase = async () => {
    try {
      setIsExporting(true);
      await userStore.cloneCompanyDatabase(
        user?.company?._id || user?.company,
        user?.username || user?.email
      );
      toast({ title: 'Export Started', description: 'You will receive an email shortly with the backup.', status: 'success', duration: 5000, isClosable: true });
    } catch (err: any) {
      toast({ title: 'Export Failed', description: err.message || 'Something went wrong', status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (profileModal.isOpen) {
      globalConfigStore.fetchGlobalConfig();
    }
  }, [profileModal.isOpen]);

  const handleClose = () => {
    setProfileModal(false, 0);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyName, setCompanyName] = useState(user?.companyDetails?.company_name || user?.companyDetail?.company_name || "");
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    title: user?.title || user?.profileDetails?.personalInfo?.title || user?.profile_details?.personalInfo?.title || "",
    name: user?.name || "",
    username: user?.username || "",
    mobile: user?.mobileNumber || user?.mobile || user?.phone || "",
    dob: user?.profileDetails?.personalInfo?.dob || user?.profile_details?.personalInfo?.dob || "",
    gender: user?.profileDetails?.personalInfo?.gender || user?.profile_details?.personalInfo?.gender || "",
    bio: user?.bio || user?.profileDetails?.personalInfo?.bio || user?.profile_details?.personalInfo?.bio || "",
    address: user?.profileDetails?.personalInfo?.addresses?.residential || user?.profile_details?.personalInfo?.addresses?.residential || ""
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const payload = {
        ...user,
        title: profileData.title,
        name: profileData.name,
        username: profileData.username,
        mobileNumber: profileData.mobile,
        dob: profileData.dob,
        gender: profileData.gender ? Number(profileData.gender) : undefined,
        bio: profileData.bio,
        addresses: {
          residential: profileData.address,
          office: user?.profileDetails?.personalInfo?.addresses?.office || "",
          other: user?.profileDetails?.personalInfo?.addresses?.other || ""
        }
      };

      await stores.userStore.updatePersonalDetails(payload);

      await stores.auth.fetchUser();
      setIsEditingProfile(false);
      toast({ title: "Success", description: "Profile updated successfully", status: "success", isClosable: true, position: "top-right", duration: 3000 });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update profile", status: "error", isClosable: true, position: "top-right", duration: 3000 });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdateCompanyName = async () => {
    if (!companyName.trim()) {
      toast({ title: "Error", description: "Company name cannot be empty", status: "error" });
      return;
    }
    setIsSavingCompany(true);
    try {
      await stores.companyStore.updateCompanyName({ newCompanyName: companyName });
      await stores.auth.fetchUser();
      setIsEditingCompany(false);
      toast({ title: "Success", description: "Company name updated successfully", status: "success", isClosable: true, position: "top-right", duration: 3000 });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update company name", status: "error", isClosable: true, position: "top-right", duration: 3000 });
    } finally {
      setIsSavingCompany(false);
    }
  };

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
    <Drawer
      isOpen={profileModal.isOpen}
      placement="right"
      onClose={handleClose}
      size={"xl"}
    >
      <DrawerOverlay backdropFilter="blur(2px)" />
      <DrawerContent
        w={{ base: "100vw", md: "85vw" }}
        maxW={{ base: "100vw", md: "85vw" }}
        h={{ base: "100dvh", md: "100vh" }}
        maxH={{ base: "100dvh", md: "100vh" }}
        borderRadius={0}
      >
        {/* Header Section: Identity */}
        <Box
          bgGradient="linear(125deg, #123B50 0%, #126C70 62%, #258F83 100%)"
          p={{ base: 3, md: 5 }}
          color="white"
          position="relative"
        >
          <DrawerCloseButton color="white" onClick={handleClose} />
          <Flex
            direction="row"
            align="center"
            gap={{ base: 3, md: 5 }}
            pr={{ base: 8, md: 0 }}
          >
            <Box position="relative" cursor="pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar
                size="md"
                boxSize={{ base: "48px", md: "64px" }}
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
            <Box minW={0} flex={1} textAlign="left">
              <Flex
                align="center"
                gap={2}
                justify="flex-start"
                wrap="wrap"
              >
                <Heading size={{ base: "sm", md: "md" }} noOfLines={1}>
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
              <Text fontSize={{ base: "xs", md: "md" }} opacity={0.9} mt={1} noOfLines={1}>
                {username}
              </Text>
              <Badge mt={{ base: 1, md: 2 }} colorScheme="orange" variant="subtle">
                {role}
              </Badge>
            </Box>
          </Flex>
        </Box>

        <DrawerBody p={0} overflow="hidden">
          <Tabs
            display="flex"
            flexDirection="column"
            h="100%"
            minH={0}
            variant="line"
            colorScheme="teal"
            index={profileModal.defaultTab}
            onChange={(index) => setProfileModal(true, index)}
          >
            <TabList
              px={{ base: 2, md: 4 }}
              pt={{ base: 1, md: 3 }}
              gap={{ base: 1, md: 2 }}
              overflowX="auto"
              flexShrink={0}
              borderBottom="1px solid"
              borderColor="gray.200"
              css={{
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
            >
              <Tab flexShrink={0} minH="44px" px={{ base: 3, md: 5 }} fontSize={{ base: "xs", md: "sm" }} fontWeight="bold">Profile</Tab>
              {user?.role === "admin" && <Tab flexShrink={0} minH="44px" px={{ base: 3, md: 5 }} fontSize={{ base: "xs", md: "sm" }} fontWeight="bold">Operating Hours</Tab>}
              <Tab flexShrink={0} minH="44px" px={{ base: 3, md: 5 }} fontSize={{ base: "xs", md: "sm" }} fontWeight="bold">Sidebar</Tab>
              <Tab flexShrink={0} minH="44px" px={{ base: 3, md: 5 }} fontSize={{ base: "xs", md: "sm" }} fontWeight="bold">Theme</Tab>
              {user?.role === "admin" && <Tab flexShrink={0} minH="44px" px={{ base: 3, md: 5 }} fontSize={{ base: "xs", md: "sm" }} fontWeight="bold">WhatsApp</Tab>}
            </TabList>

            <TabPanels flex={1} minH={0} overflowY="auto">
              {/* TAB 1: Profile Overview */}
              <TabPanel p={{ base: 3, md: 6 }}>
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                  <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
                    <Flex align={{ base: "flex-start", sm: "center" }} justify="space-between" direction={{ base: "column", sm: "row" }} gap={3}>
                      <HStack spacing={3} minW={0}>
                        <Avatar size="md" flexShrink={0} src={pic?.url} name={name} />
                        <Box minW={0}>
                          <Text fontWeight="bold">Profile Picture</Text>
                          <Text fontSize="xs" color="gray.500">Upload a new avatar to personalize your account</Text>
                        </Box>
                      </HStack>
                      <Button
                        size="sm"
                        minH="40px"
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
                      <Flex align={{ base: "flex-start", sm: "center" }} justify="space-between" direction={{ base: "column", sm: "row" }} gap={3}>
                        <HStack spacing={3} minW={0}>
                          <Avatar size="md" flexShrink={0} src={companyLogo?.url} name={user?.companyDetail?.company_name} borderRadius="md" />
                          <Box minW={0}>
                            <Text fontWeight="bold">Company Logo</Text>
                            <Text fontSize="sm" color="gray.500">Update the logo for your clinic/company</Text>
                          </Box>
                        </HStack>
                        <Button
                          size="sm"
                          minH="40px"
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
                  
                  {/* Personal Details */}
                  <Box>
                    <Flex align="center" justify="space-between" mb={3}>
                      <Text fontWeight="bold">Personal Details</Text>
                      {!isEditingProfile ? (
                        <Button size="xs" variant="outline" colorScheme="blue" onClick={() => {
                          setProfileData({
                            title: user?.title || user?.profileDetails?.personalInfo?.title || user?.profile_details?.personalInfo?.title || "",
                            name: user?.name || "",
                            username: user?.username || "",
                            mobile: user?.mobileNumber || user?.mobile || user?.phone || "",
                            dob: user?.profileDetails?.personalInfo?.dob || user?.profile_details?.personalInfo?.dob || "",
                            gender: user?.profileDetails?.personalInfo?.gender || user?.profile_details?.personalInfo?.gender || "",
                            bio: user?.bio || user?.profileDetails?.personalInfo?.bio || user?.profile_details?.personalInfo?.bio || "",
                            address: user?.profileDetails?.personalInfo?.addresses?.residential || user?.profile_details?.personalInfo?.addresses?.residential || ""
                          });
                          setIsEditingProfile(true);
                        }}>Edit</Button>
                      ) : (
                        <HStack spacing={2}>
                          <Button size="xs" colorScheme="green" isLoading={isSavingProfile} onClick={handleSaveProfile}>Save</Button>
                          <Button size="xs" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                        </HStack>
                      )}
                    </Flex>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {!isEditingProfile ? (
                        <>
                          <DetailItem label="Title" value={user?.title || user?.profileDetails?.personalInfo?.title || user?.profile_details?.personalInfo?.title} icon={InfoIcon} />
                          <DetailItem label="Name" value={user?.name} icon={InfoIcon} />
                          <DetailItem label="Email" value={user?.username} icon={InfoIcon} />
                          <DetailItem label="Mobile" value={user?.mobileNumber || user?.mobile || user?.phone} icon={InfoIcon} />
                          <DetailItem label="DOB" value={user?.profileDetails?.personalInfo?.dob || user?.profile_details?.personalInfo?.dob} icon={CalendarIcon} />
                          <DetailItem label="Gender" value={(user?.profileDetails?.personalInfo?.gender || user?.profile_details?.personalInfo?.gender) === 1 ? "Male" : (user?.profileDetails?.personalInfo?.gender || user?.profile_details?.personalInfo?.gender) === 2 ? "Female" : (user?.profileDetails?.personalInfo?.gender || user?.profile_details?.personalInfo?.gender) === 3 ? "Other" : "-"} icon={InfoIcon} />
                          <DetailItem label="Address" value={user?.profileDetails?.personalInfo?.addresses?.residential || user?.profile_details?.personalInfo?.addresses?.residential} icon={InfoIcon} />
                          <DetailItem label="Bio" value={user?.bio || user?.profileDetails?.personalInfo?.bio || user?.profile_details?.personalInfo?.bio} icon={InfoIcon} />
                        </>
                      ) : (
                        <>
                          <Box p={3} borderWidth="1px" borderRadius="lg" bg="gray.50">
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" mb={1}>Title</Text>
                            <Select size="sm" bg="white" value={profileData.title} onChange={(e) => setProfileData({...profileData, title: e.target.value})}>
                              <option value="">Select Title</option>
                              <option value="Mr.">Mr.</option>
                              <option value="Ms.">Ms.</option>
                              <option value="Mrs.">Mrs.</option>
                              <option value="Dr.">Dr.</option>
                            </Select>
                          </Box>
                          <Box p={3} borderWidth="1px" borderRadius="lg" bg="gray.50">
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" mb={1}>Name</Text>
                            <Input size="sm" bg="white" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                          </Box>
                          <Box p={3} borderWidth="1px" borderRadius="lg" bg="gray.50">
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" mb={1}>Email</Text>
                            <Input size="sm" bg="white" value={profileData.username} onChange={(e) => setProfileData({...profileData, username: e.target.value})} />
                          </Box>
                          <Box p={3} borderWidth="1px" borderRadius="lg" bg="gray.50">
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" mb={1}>Mobile</Text>
                            <Input size="sm" bg="white" value={profileData.mobile} onChange={(e) => setProfileData({...profileData, mobile: e.target.value})} />
                          </Box>
                          <Box p={3} borderWidth="1px" borderRadius="lg" bg="gray.50">
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" mb={1}>DOB</Text>
                            <Input size="sm" type="date" bg="white" value={profileData.dob} onChange={(e) => setProfileData({...profileData, dob: e.target.value})} />
                          </Box>
                          <Box p={3} borderWidth="1px" borderRadius="lg" bg="gray.50">
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" mb={1}>Gender</Text>
                            <Select size="sm" bg="white" value={profileData.gender} onChange={(e) => setProfileData({...profileData, gender: e.target.value})}>
                              <option value="">Select Gender</option>
                              <option value="1">Male</option>
                              <option value="2">Female</option>
                              <option value="3">Other</option>
                            </Select>
                          </Box>
                          <Box p={3} borderWidth="1px" borderRadius="lg" bg="gray.50">
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" mb={1}>Address</Text>
                            <Input size="sm" bg="white" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} />
                          </Box>
                          <Box p={3} borderWidth="1px" borderRadius="lg" bg="gray.50">
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" mb={1}>Bio</Text>
                            <Textarea size="sm" bg="white" value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} />
                          </Box>
                        </>
                      )}
                    </SimpleGrid>
                  </Box>

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
                      {user?.role === "admin" ? (
                        <Box p={3} borderWidth="1px" borderRadius="lg" bg="gray.50">
                          <Flex align="center" justify="space-between" mb={1}>
                            <Flex align="center">
                              <Icon as={CheckCircleIcon} color="blue.500" mr={2} boxSize={3} />
                              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                                Company
                              </Text>
                            </Flex>
                            {!isEditingCompany ? (
                              <Button size="xs" variant="ghost" colorScheme="blue" onClick={() => setIsEditingCompany(true)}>Edit</Button>
                            ) : (
                              <HStack spacing={1}>
                                <Button size="xs" colorScheme="green" isLoading={isSavingCompany} onClick={handleUpdateCompanyName}>Save</Button>
                                <Button size="xs" variant="ghost" onClick={() => { setIsEditingCompany(false); setCompanyName(user?.companyDetails?.company_name || user?.companyDetail?.company_name || ""); }}>Cancel</Button>
                              </HStack>
                            )}
                          </Flex>
                          {!isEditingCompany ? (
                            <Text fontSize="md" fontWeight="medium" color="gray.700">
                              {user?.companyDetails?.company_name || user?.companyDetail?.company_name || "-"}
                            </Text>
                          ) : (
                            <Input size="sm" value={companyName} onChange={(e) => setCompanyName(e.target.value)} bg="white" />
                          )}
                        </Box>
                      ) : (
                        <DetailItem
                          label="Company"
                          value={companyDetails?.company_name}
                          icon={CheckCircleIcon}
                        />
                      )}
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

                  {user?.role === "admin" && (
                    <>
                      <Divider />
                      {/* Database Export Section */}
                      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
                        <Flex align={{ base: "flex-start", sm: "center" }} justify="space-between" direction={{ base: "column", sm: "row" }}>
                          <Box mb={{ base: 3, sm: 0 }} mr={4}>
                            <Text fontWeight="bold">Database Backup</Text>
                            <Text fontSize="sm" color="gray.500">Download a complete readable export of all your records to your email.</Text>
                          </Box>
                          <Button 
                            size="sm" 
                            colorScheme="blue" 
                            leftIcon={<DownloadIcon />}
                            isLoading={isExporting}
                            onClick={handleExportDatabase}
                            flexShrink={0}
                          >
                            Export Database
                          </Button>
                        </Flex>
                      </Box>
                    </>
                  )}

                  <Divider />
                  {/* Payment Section */}
                  <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
                    <Flex align="center" justify="space-between" mb={4}>
                      <Box>
                        <Text fontWeight="bold">Make a Payment</Text>
                        <Text fontSize="sm" color="gray.500">Scan this QR code or use the details below to make a payment</Text>
                      </Box>
                    </Flex>
                    <Box textAlign="center">
                      <Image 
                        src={globalConfigStore.config?.paymentQrCode || "/images/payment-ss.png"} 
                        alt="Payment Details" 
                        maxW={{ base: "100%", md: "400px" }} 
                        mx="auto" 
                        borderRadius="md" 
                        border="1px solid"
                        borderColor="gray.200"
                        boxShadow="sm"
                      />
                    </Box>
                  </Box>
                </VStack>
              </TabPanel>

              {/* TAB 2: Operating Hours */}
              {user?.role === "admin" && (
                <TabPanel p={{ base: 2, md: 6 }}>
                  <OperatingHours schedule={schedule} setSchedule={setSchedule} />
                </TabPanel>
              )}

              <TabPanel p={{ base: 2, md: 6 }}>
                <ProfileSettings />
              </TabPanel>

              {/* TAB 4: Theme Settings */}
              <TabPanel p={0}>
                <ThemeSettings />
              </TabPanel>

              {/* TAB 5: WhatsApp Settings */}
              {user?.role === "admin" && (
                <TabPanel p={{ base: 2, md: 6 }}>
                  <WhatsappSettings user={user} />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </DrawerBody>

        <DrawerFooter
          bg="gray.50"
          px={{ base: 3, md: 6 }}
          py={{ base: 2, md: 4 }}
          gap={2}
          borderTop="1px solid"
          borderColor="gray.200"
        >
          <Button
            variant="ghost"
            flex={{ base: 1, md: "initial" }}
            minH="44px"
            onClick={handleClose}
          >
            Close
          </Button>

          <Button
            colorScheme="blue"
            leftIcon={<CheckIcon />}
            flex={{ base: 2, md: "initial" }}
            minH="44px"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

export default ProfileDetailsModal;
