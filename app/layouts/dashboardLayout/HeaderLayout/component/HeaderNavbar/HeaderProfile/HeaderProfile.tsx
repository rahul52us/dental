"use client";

import {
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider,
  Box,
  Text,
  VStack,
  Icon,
  Portal,
  useDisclosure,
  useColorModeValue,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  Button,
  HStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import {
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaKey,
  FaHome,
  FaLock,
} from "react-icons/fa";
import stores from "../../../../../../store/stores";
import { authentication, main } from "../../../../../../config/utils/routes";
import { useRouter, usePathname } from "next/navigation";
import { WEBSITE_TITLE } from "../../../../../../config/utils/variables";
import ChangePasswordModal from "./component/ChangePasswordModal";

const HeaderProfile = observer(() => {
  const { auth: { doLogout } } = stores;
  const pathname = usePathname();
  const router = useRouter();
  const {
    auth: { user },
    themeStore: { setProfileModal },
  } = stores;
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const {
    isOpen: isPasswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose,
  } = useDisclosure();
  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose,
  } = useDisclosure();



  return user ? (
    <>
      <IconButton
        display={{ base: "inline-flex", md: "none" }}
        aria-label="Open profile menu"
        icon={
          <Avatar
            src={user?.pic?.url || undefined}
            size="xs"
            boxSize="20px"
            borderRadius="full"
            border="1.5px solid rgba(255, 255, 255, 0.9)"
            name={user?.name}
            bg="white"
          />
        }
        variant="ghost"
        w="30px"
        h="30px"
        minW="30px"
        borderRadius="9px"
        p={0}
        bg="whiteAlpha.180"
        border="1px solid rgba(255,255,255,0.12)"
        onClick={onProfileOpen}
      />
      <Drawer isOpen={isProfileOpen && isMobile} placement="right" onClose={onProfileClose} size="full">
        <DrawerOverlay bg="blackAlpha.600" />
        <DrawerContent
          w="100vw"
          maxW="100vw"
          h="100dvh"
          maxH="100dvh"
          borderRadius={0}
          bg={useColorModeValue("gray.50", "gray.900")}
        >
          <DrawerHeader
            p={5}
            color="white"
            bgGradient="linear(135deg, #123B50 0%, #126C70 62%, #258F83 100%)"
            borderBottom="1px solid"
            borderColor="whiteAlpha.200"
          >
            <HStack spacing={3} pr={8} align="center">
              <Avatar
                src={user?.pic?.url || undefined}
                name={user?.name}
                size="md"
                border="2px solid"
                borderColor="whiteAlpha.700"
              />
              <Box minW={0}>
                <Text fontSize="xs" color="whiteAlpha.800" fontWeight="700">
                  Account
                </Text>
                <Text mt={0.5} fontSize="md" fontWeight="800" noOfLines={1}>
                  {user?.name || "User"}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.800" noOfLines={1}>
                  {user?.email || user?.userType || WEBSITE_TITLE?.split("-").join(" ")}
                </Text>
              </Box>
            </HStack>
            <DrawerCloseButton
              top={4}
              right={4}
              color="white"
              borderRadius="full"
              bg="whiteAlpha.200"
              _hover={{ bg: "whiteAlpha.300" }}
            />
          </DrawerHeader>
          <DrawerBody px={4} py={5}>
            <Text
              mb={3}
              px={1}
              fontSize="xs"
              fontWeight="800"
              color={useColorModeValue("gray.500", "gray.400")}
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              Account options
            </Text>
            <VStack align="stretch" spacing={2}>
              {pathname !== main.home && (
                <Button
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FaHome} color="teal.500" />}
                  minH="52px"
                  variant="ghost"
                  borderRadius="14px"
                  bg={useColorModeValue("white", "whiteAlpha.100")}
                  color={useColorModeValue("gray.700", "gray.100")}
                  onClick={() => {
                    onProfileClose();
                    router.push(main.home);
                  }}
                  _hover={{ bg: useColorModeValue("teal.50", "whiteAlpha.200") }}
                >
                  Home
                </Button>
              )}
              <Button
                justifyContent="flex-start"
                leftIcon={<Icon as={FaCog} color="teal.500" />}
                minH="52px"
                variant="ghost"
                borderRadius="14px"
                bg={useColorModeValue("white", "whiteAlpha.100")}
                color={useColorModeValue("gray.700", "gray.100")}
                onClick={() => {
                  onProfileClose();
                  setProfileModal(true, 2);
                }}
                _hover={{ bg: useColorModeValue("teal.50", "whiteAlpha.200") }}
              >
                Profile settings
              </Button>
              <Button
                justifyContent="flex-start"
                leftIcon={<Icon as={FaLock} color="teal.500" />}
                minH="52px"
                variant="ghost"
                borderRadius="14px"
                bg={useColorModeValue("white", "whiteAlpha.100")}
                color={useColorModeValue("gray.700", "gray.100")}
                onClick={() => {
                  onProfileClose();
                  onPasswordOpen();
                }}
                _hover={{ bg: useColorModeValue("teal.50", "whiteAlpha.200") }}
              >
                Change password
              </Button>
            </VStack>
          </DrawerBody>
          <DrawerFooter
            px={4}
            pt={3}
            pb="calc(16px + env(safe-area-inset-bottom, 0px))"
            borderTop="1px solid"
            borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
          >
            <Button
              w="100%"
              minH="50px"
              leftIcon={<FaSignOutAlt />}
              colorScheme="red"
              variant="subtle"
              borderRadius="14px"
              onClick={() => {
                onProfileClose();
                doLogout();
                router.push(authentication.login);
              }}
            >
              Logout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Menu closeOnSelect={false} placement="bottom-end">
        <MenuButton
          display={{ base: "none", md: "inline-flex" }}
          as={IconButton}
          aria-label="User Menu"
          icon={
            <Avatar
              src={user?.pic?.url || undefined}
              size="xs"
              boxSize={{ base: "20px", sm: "24px", md: "26px" }}
              borderRadius="full"
              border="1.5px solid rgba(255, 255, 255, 0.9)"
              name={user?.name}
              bg="white"
            />
          }
          variant="ghost"
          w={{ base: "30px", sm: "36px", md: "38px" }}
          h={{ base: "30px", sm: "36px", md: "38px" }}
          minW={{ base: "30px", sm: "36px", md: "38px" }}
          borderRadius="10px"
          p={0}
          bg="whiteAlpha.180"
          border="1px solid rgba(255,255,255,0.12)"
          _hover={{ bg: "whiteAlpha.300", transform: "scale(1.05)" }}
          _active={{ bg: "whiteAlpha.400", transform: "scale(0.95)" }}
          transition="all 0.15s ease"
          title="User menu"
        />
        <Portal>
          <MenuList
            minWidth="240px"
            boxShadow="0 10px 40px rgba(0,0,0,0.1)"
            borderRadius="2xl"
            zIndex={10}
            p={2}
            bg={useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(23, 25, 35, 0.95)")}
            backdropFilter="blur(15px)"
            border="1px solid"
            borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
          >
            <VStack spacing={3} py={1}>
              <Box textAlign="center" pt={4} pb={2}>
                <Avatar src={user?.pic?.url || undefined} size="xl" name={user?.name} border="4px solid" borderColor={useColorModeValue("white", "gray.800")} shadow="lg" />
                <Text mt={3} fontWeight="800" fontSize="lg" color={useColorModeValue("gray.800", "white")}>{user?.name}</Text>
                <Text mt={0.5} fontWeight="700" fontSize="xs" color="gray.500" letterSpacing="wide">
                  {WEBSITE_TITLE?.split("-").join(" ")}
                </Text>
              </Box>

              <Divider borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} />

              <Box width="100%" px={1}>
                {user && pathname !== main.home && (
                  <MenuItem
                    icon={<FaHome />}
                    onClick={() => router.push(main.home)}
                    borderRadius="lg"
                    py={2.5}
                    _hover={{ bg: useColorModeValue("brand.50", "whiteAlpha.100"), color: "brand.500" }}
                  >
                    <Text fontWeight="700">Home</Text>
                  </MenuItem>
                )}
                <MenuItem
                  icon={<FaCog />}
                  onClick={() => setProfileModal(true, 2)}
                  borderRadius="lg"
                  py={2.5}
                  _hover={{ bg: useColorModeValue("brand.50", "whiteAlpha.100"), color: "brand.500" }}
                >
                  <Text fontWeight="700">Profile Settings</Text>
                </MenuItem>
                <MenuItem
                  icon={<FaLock />}
                  onClick={onPasswordOpen}
                  borderRadius="lg"
                  py={2.5}
                  _hover={{ bg: useColorModeValue("brand.50", "whiteAlpha.100"), color: "brand.500" }}
                >
                  <Text fontWeight="700">Change Password</Text>
                </MenuItem>
              </Box>

              <Divider borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} />

              <Box width="100%" px={1} pt={1}>
                <MenuItem
                  icon={<FaSignOutAlt />}
                  color="red.500"
                  borderRadius="lg"
                  py={2.5}
                  _hover={{ bg: "red.50" }}
                  onClick={() => {
                    doLogout();
                    router.push(authentication.login);
                  }}
                >
                  <Text fontWeight="800">Logout</Text>
                </MenuItem>
              </Box>
            </VStack>
          </MenuList>
        </Portal>
      </Menu>
      <ChangePasswordModal isOpen={isPasswordOpen} onClose={onPasswordClose} />
    </>
  ) : (
    <Menu closeOnSelect={false} placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="User Menu"
        icon={<Avatar size="xs" boxSize="26px" borderRadius="full" />}
        variant="ghost"
        w={{ base: "36px", md: "40px" }}
        h={{ base: "36px", md: "40px" }}
        minW={{ base: "36px", md: "40px" }}
        borderRadius="full"
        p={0}
        bg="whiteAlpha.150"
        _hover={{ bg: "whiteAlpha.300" }}
        _active={{ bg: "whiteAlpha.400" }}
      />
      <Portal>
        <MenuList minWidth="220px" boxShadow="md" borderRadius="md" zIndex={10} p={2}>
          <VStack spacing={2}>
            <MenuItem onClick={() => router.push(authentication.login)}>
              <Icon as={FaUser} boxSize={6} mr={2} color="blue.500" />
              <Text>Login</Text>
            </MenuItem>
            <MenuItem onClick={() => router.push(authentication.createOrganisationStep1)}>
              <Icon as={FaKey} boxSize={6} mr={2} color="blue.500" />
              <Text>Create New Account</Text>
            </MenuItem>
          </VStack>
        </MenuList>
      </Portal>
    </Menu>
  );
});

export default HeaderProfile;