"use client";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  Spinner,
  VStack,
  Icon,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useState } from "react";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiMailLine,
  RiUserLine,
  RiLockLine,
  RiArrowRightLine,
} from "react-icons/ri";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";
import { motion, AnimatePresence } from "framer-motion";
import stores from "../../store/stores";

const Login = observer(() => {
  const {
    auth: { login, openNotification },
  } = stores;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    loginType: "code",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const isEmail = formData.loginType === "email";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLoginType = (type: "email" | "code") => {
    setFormData({ ...formData, loginType: type });
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response: any = await login(formData);

      openNotification({
        title: "Login Successful",
        message: `${response.message}!`,
        type: "success",
        duration: 3000,
      });

      if (response?.data?.userType === "superAdmin") {
        router.push("/dashboard/admins");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      openNotification({
        title: "Login Failed",
        message:
          error?.message || error?.response?.message || "Invalid credentials",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    bg: "white",
    border: "1.5px solid",
    borderColor: "gray.200",
    _hover: { borderColor: "gray.300" },
    _focus: {
      borderColor: "teal.500",
      boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.3)",
    },
    sx: {
      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 100px white inset !important",
        WebkitTextFillColor: "gray.800",
        transition: "background-color 5000s ease-in-out 0s",
      },
    },
  };

  return (
    <Flex direction="column" justify="center" w="100%" style={{ perspective: "1000px" }}>
      <VStack spacing={{ base: 5, md: 6 }} align="stretch" w="100%">
        
        {/* Desktop Only Header */}
        <Box display={{ base: "none", md: "block" }} textAlign="start">
          <Heading fontSize="3xl" color="gray.900" fontWeight="800" letterSpacing="tight">
            Welcome back
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1} fontWeight="400">
            Enter your credentials to access your portal account.
          </Text>
        </Box>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={4} align="stretch" w="100%">
            
            {/* Segmented Login Type Toggle - FIXED FOR BOTH LIGHT & DARK MODES */}
            <Box 
              p={1} 
              bg={{ base: "whiteAlpha.200", md: "gray.100" }} 
              rounded="2xl" 
              border="1px solid" 
              borderColor={{ base: "whiteAlpha.300", md: "gray.200" }}
              backdropFilter={{ base: "blur(10px)", md: "none" }}
            >
              <HStack spacing={1}>
                <Button
                  flex={1}
                  height="40px"
                  rounded="xl"
                  bg={!isEmail ? "white" : "transparent"}
                  color={!isEmail ? "teal.700" : { base: "gray.400", md: "gray.500" }}
                  fontWeight="700"
                  fontSize="xs"
                  boxShadow={!isEmail ? "0 2px 6px rgba(0,0,0,0.1)" : "none"}
                  _hover={{ color: !isEmail ? "teal.700" : { base: "white", md: "gray.800" } }}
                  onClick={() => handleLoginType("code")}
                  leftIcon={<RiUserLine size={16} />}
                  transition="all 0.2s"
                >
                  User Code
                </Button>
                <Button
                  flex={1}
                  height="40px"
                  rounded="xl"
                  bg={isEmail ? "white" : "transparent"}
                  color={isEmail ? "teal.700" : { base: "gray.400", md: "gray.500" }}
                  fontWeight="700"
                  fontSize="xs"
                  boxShadow={isEmail ? "0 2px 6px rgba(0,0,0,0.1)" : "none"}
                  _hover={{ color: isEmail ? "teal.700" : { base: "white", md: "gray.800" } }}
                  onClick={() => handleLoginType("email")}
                  leftIcon={<RiMailLine size={16} />}
                  transition="all 0.2s"
                >
                  Email Address
                </Button>
              </HStack>
            </Box>

            {/* Username / Code Field with 3D FLIP ANIMATION */}
            <FormControl>
              <FormLabel 
                fontSize="xs" 
                fontWeight="700" 
                color={{ base: "white", md: "gray.700" }} 
                mb={1.5}
              >
                {isEmail ? "Email Address" : "User Code"}
              </FormLabel>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={isEmail ? "email" : "code"}
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -90, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ width: "100%", transformStyle: "preserve-3d" }}
                >
                  <InputGroup size="lg">
                    <InputLeftElement h="50px" w="48px" pointerEvents="none" color="gray.400" display="flex" alignItems="center" justifyContent="center">
                      {isEmail ? <RiMailLine size={18} /> : <RiUserLine size={18} />}
                    </InputLeftElement>
                    <Input
                      type="text"
                      name="username"
                      placeholder={isEmail ? "name@practice.com" : "e.g. USR-9042"}
                      value={formData.username}
                      onChange={handleInputChange}
                      height="50px"
                      rounded="xl"
                      required
                      pl="48px"
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.800"
                      _placeholder={{ color: "gray.400", fontWeight: "400" }}
                      transition="all 0.2s"
                      {...inputStyle}
                    />
                  </InputGroup>
                </motion.div>
              </AnimatePresence>
            </FormControl>

            {/* Password Field */}
            <FormControl>
              <FormLabel 
                fontSize="xs" 
                fontWeight="700" 
                color={{ base: "white", md: "gray.700" }} 
                mb={1.5}
              >
                Password
              </FormLabel>
              <InputGroup size="lg">
                <InputLeftElement h="50px" w="48px" pointerEvents="none" color="gray.400" display="flex" alignItems="center" justifyContent="center">
                  <RiLockLine size={18} />
                </InputLeftElement>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  height="50px"
                  rounded="xl"
                  required
                  pl="48px"
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.800"
                  _placeholder={{ color: "gray.400", fontWeight: "400" }}
                  transition="all 0.2s"
                  {...inputStyle}
                />
                <InputRightElement
                  h="50px"
                  w="48px"
                  cursor="pointer"
                  onClick={handleTogglePassword}
                  color="gray.400"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  _hover={{ color: "teal.600" }}
                >
                  {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {/* Options Row */}
            <Flex justify="space-between" align="center" pt={1} px={0.5}>
              <Checkbox colorScheme="teal" size="sm" rounded="md">
                <Text fontSize="xs" color={{ base: "white", md: "gray.600" }} fontWeight="600">
                  Remember me
                </Text>
              </Checkbox>
              <Link href="/forgot-password">
                <Text
                  fontSize="xs"
                  color={{ base: "teal.300", md: "teal.600" }}
                  fontWeight="700"
                  _hover={{ color: { base: "teal.200", md: "teal.700" }, textDecoration: "underline" }}
                >
                  Forgot Password?
                </Text>
              </Link>
            </Flex>

            {/* Submit Button */}
            <Button
              size="lg"
              width="100%"
              type="submit"
              height="52px"
              rounded="xl"
              bgGradient="linear(to-r, teal.400, cyan.500)"
              color="white"
              fontWeight="700"
              fontSize="md"
              mt={3}
              boxShadow="0 8px 20px -4px rgba(20, 184, 166, 0.6)"
              _hover={{
                bgGradient: "linear(to-r, teal.500, cyan.600)",
                transform: "translateY(-1px)",
                boxShadow: "0 12px 24px -4px rgba(20, 184, 166, 0.8)",
              }}
              _active={{ transform: "scale(0.98)" }}
              transition="all 0.2s"
              isDisabled={!formData.username || !formData.password || isLoading}
              rightIcon={!isLoading ? <Icon as={RiArrowRightLine} w={5} h={5} /> : undefined}
            >
              {isLoading ? <Spinner size="md" color="white" /> : "Sign In"}
            </Button>
          </VStack>
        </form>
      </VStack>
    </Flex>
  );
});

export default Login;