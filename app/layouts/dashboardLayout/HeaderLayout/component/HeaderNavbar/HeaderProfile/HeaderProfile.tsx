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
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import {
  FaCog,
  FaPalette,
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
  const { isOpen, onOpen, onClose } = useDisclosure();



  return user ? (
    <>
      <Menu closeOnSelect={false} placement="bottom-end">
        <MenuButton
          as={IconButton}
          aria-label="User Menu"
          icon={
            <Avatar
              src={user?.pic?.url || undefined}
              size="sm"
              borderRadius={10}
              name={user?.name}
            />
          }
          size="sm"
          variant="ghost"
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
                  onClick={onOpen}
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
      <ChangePasswordModal isOpen={isOpen} onClose={onClose} />
    </>
  ) : (
    <Menu closeOnSelect={false} placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="User Menu"
        icon={<Avatar size="sm" borderRadius="full" />}
        size="sm"
        variant="ghost"
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