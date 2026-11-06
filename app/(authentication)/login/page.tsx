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
  RiMailCheckLine,
  RiUserSmileLine,
  RiLockPasswordLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiSparklingFill,
  RiHeartPulseLine,
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
    bg: "#F8FAFC",
    border: "1.5px solid",
    borderColor: "#E2E8F0",
    _hover: { borderColor: "gray.300", bg: "white" },
    _focus: {
      borderColor: "#0EA5E9",
      bg: "white",
      boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.2)",
    },
    sx: {
      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 100px #F8FAFC inset !important",
        WebkitTextFillColor: "gray.800",
        transition: "background-color 5000s ease-in-out 0s",
      },
    },
  };

  return (
    <Flex direction="column" justify="center" w="100%" style={{ perspective: "1000px" }}>
      <VStack spacing={{ base: 1.5, md: 3.5 }} align="stretch" w="100%">
        {/* Greeting Header */}
        <Box textAlign={{ base: "center", md: "start" }} mb={{ base: 1, md: 3 }}>
          <HStack
            display={{ base: "none", md: "inline-flex" }}
            spacing={1.5}
            bg="teal.50"
            border="1px solid"
            borderColor="teal.150"
            px={2.5}
            py={0.8}
            rounded="full"
            w="fit-content"
            mx={{ base: "auto", md: "0" }}
            mb={2}
          >
            <Icon as={RiSparklingFill} color="teal.500" boxSize={3} />
            <Text fontSize="10px" fontWeight="800" color="teal.700" letterSpacing="0.4px" textTransform="uppercase">
              Clinical Portal Access
            </Text>
          </HStack>
          <Heading
            fontSize={{ base: "17px", sm: "19px", md: "26px" }}
            color="gray.900"
            fontWeight="900"
            letterSpacing="tight"
          >
            Welcome back 👋
          </Heading>
          <Text
            fontSize={{ base: "10.5px", sm: "11.5px", md: "sm" }}
            color="gray.500"
            mt={0.5}
            fontWeight="500"
          >
            Sign in to access patient records and schedule
          </Text>
        </Box>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={{ base: 1.5, md: 3 }} align="stretch" w="100%">
            {/* Segmented Switcher */}
            <Box
              p={{ base: "2.5px", md: "4px" }}
              bg="#F1F5F9"
              rounded={{ base: "14px", md: "18px" }}
              border="1px solid"
              borderColor="#E2E8F0"
              boxShadow="inset 0 1px 2px rgba(0,0,0,0.03)"
            >
              <HStack spacing={1}>
                <Button
                  flex={1}
                  height={{ base: "32px", md: "42px" }}
                  rounded={{ base: "11px", md: "14px" }}
                  bg={!isEmail ? "white" : "transparent"}
                  color={!isEmail ? "teal.900" : "gray.500"}
                  fontWeight={!isEmail ? "800" : "600"}
                  fontSize={{ base: "11px", md: "xs" }}
                  letterSpacing="0.2px"
                  boxShadow={!isEmail ? "0 2px 6px rgba(0,0,0,0.08)" : "none"}
                  _hover={{ color: !isEmail ? "teal.900" : "gray.800" }}
                  onClick={() => handleLoginType("code")}
                  leftIcon={
                    <RiUserSmileLine
                      size={15}
                      color={!isEmail ? "#0D9488" : "currentColor"}
                    />
                  }
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  User Code
                </Button>
                <Button
                  flex={1}
                  height={{ base: "32px", md: "42px" }}
                  rounded={{ base: "11px", md: "14px" }}
                  bg={isEmail ? "white" : "transparent"}
                  color={isEmail ? "teal.900" : "gray.500"}
                  fontWeight={isEmail ? "800" : "600"}
                  fontSize={{ base: "11px", md: "xs" }}
                  letterSpacing="0.2px"
                  boxShadow={isEmail ? "0 2px 6px rgba(0,0,0,0.08)" : "none"}
                  _hover={{ color: isEmail ? "teal.900" : "gray.800" }}
                  onClick={() => handleLoginType("email")}
                  leftIcon={
                    <RiMailCheckLine
                      size={15}
                      color={isEmail ? "#0D9488" : "currentColor"}
                    />
                  }
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  Email Address
                </Button>
              </HStack>
            </Box>

            {/* Username / Code Field */}
            <FormControl>
              <FormLabel
                fontSize={{ base: "10.5px", md: "xs" }}
                fontWeight="700"
                letterSpacing="0.3px"
                color="gray.700"
                mb={0.5}
              >
                {isEmail ? "Email Address" : "User Code"}
              </FormLabel>

              <AnimatePresence mode="wait">
                <motion.div
                  key={isEmail ? "email" : "code"}
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -90, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  style={{ width: "100%", transformStyle: "preserve-3d" }}
                >
                  <InputGroup size={{ base: "sm", md: "lg" }}>
                    <InputLeftElement
                      h={{ base: "38px", md: "50px" }}
                      w={{ base: "38px", md: "48px" }}
                      pointerEvents="none"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Flex
                        w={{ base: "26px", md: "34px" }}
                        h={{ base: "26px", md: "34px" }}
                        rounded={{ base: "lg", md: "xl" }}
                        bg="teal.50"
                        align="center"
                        justify="center"
                        boxShadow="0 1px 2px rgba(0,0,0,0.04)"
                      >
                        {isEmail ? (
                          <RiMailCheckLine size={14} color="#0D9488" />
                        ) : (
                          <RiUserSmileLine size={14} color="#0D9488" />
                        )}
                      </Flex>
                    </InputLeftElement>
                    <Input
                      type="text"
                      name="username"
                      placeholder={
                        isEmail ? "name@practice.com" : "e.g. USR-9042"
                      }
                      value={formData.username}
                      onChange={handleInputChange}
                      height={{ base: "38px", md: "50px" }}
                      rounded={{ base: "12px", md: "16px" }}
                      required
                      pl={{ base: "40px", md: "50px" }}
                      fontSize={{ base: "12px", md: "sm" }}
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
                fontSize={{ base: "10.5px", md: "xs" }}
                fontWeight="700"
                letterSpacing="0.3px"
                color="gray.700"
                mb={0.5}
              >
                Password
              </FormLabel>
              <InputGroup size={{ base: "sm", md: "lg" }}>
                <InputLeftElement
                  h={{ base: "38px", md: "50px" }}
                  w={{ base: "38px", md: "48px" }}
                  pointerEvents="none"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Flex
                    w={{ base: "26px", md: "34px" }}
                    h={{ base: "26px", md: "34px" }}
                    rounded={{ base: "lg", md: "xl" }}
                    bg="cyan.50"
                    align="center"
                    justify="center"
                    boxShadow="0 1px 2px rgba(0,0,0,0.04)"
                  >
                    <RiLockPasswordLine size={14} color="#0284C7" />
                  </Flex>
                </InputLeftElement>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  height={{ base: "38px", md: "50px" }}
                  rounded={{ base: "12px", md: "16px" }}
                  required
                  pl={{ base: "40px", md: "50px" }}
                  fontSize={{ base: "12px", md: "sm" }}
                  fontWeight="600"
                  color="gray.800"
                  _placeholder={{ color: "gray.400", fontWeight: "400" }}
                  transition="all 0.2s"
                  {...inputStyle}
                />
                <InputRightElement
                  h={{ base: "38px", md: "50px" }}
                  w={{ base: "38px", md: "48px" }}
                  cursor="pointer"
                  onClick={handleTogglePassword}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Flex
                    w={{ base: "26px", md: "34px" }}
                    h={{ base: "26px", md: "34px" }}
                    rounded={{ base: "lg", md: "xl" }}
                    bg="gray.100"
                    align="center"
                    justify="center"
                    color="gray.500"
                    _hover={{ bg: "teal.50", color: "teal.600" }}
                    transition="all 0.2s"
                  >
                    {showPassword ? (
                      <RiEyeOffLine size={14} />
                    ) : (
                      <RiEyeLine size={14} />
                    )}
                  </Flex>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {/* Options Row */}
            <Flex justify="space-between" align="center" pt={0} px={0.5}>
              <Checkbox
                colorScheme="teal"
                size="sm"
                rounded="md"
                iconColor="white"
              >
                <Text fontSize={{ base: "10.5px", md: "xs" }} color="gray.600" fontWeight="600">
                  Remember me
                </Text>
              </Checkbox>
              <Link href="/forgot-password">
                <Text
                  fontSize={{ base: "10.5px", md: "xs" }}
                  color="teal.600"
                  fontWeight="700"
                  _hover={{
                    color: "teal.700",
                    textDecoration: "underline",
                  }}
                >
                  Forgot Password?
                </Text>
              </Link>
            </Flex>

            {/* Submit Button */}
            <Button
              size="md"
              width="100%"
              type="submit"
              height={{ base: "40px", md: "52px" }}
              rounded={{ base: "13px", md: "16px" }}
              bgGradient="linear(135deg, #0EA5E9 0%, #0D9488 45%, #4F46E5 100%)"
              color="white"
              fontWeight="800"
              fontSize={{ base: "13px", md: "15px" }}
              letterSpacing="0.3px"
              mt={0.5}
              boxShadow="0 6px 18px -3px rgba(13, 148, 136, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35)"
              _hover={{
                bgGradient:
                  "linear(135deg, #0284C7 0%, #0F766E 45%, #4338CA 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 10px 22px -3px rgba(13, 148, 136, 0.55)",
              }}
              _active={{ transform: "scale(0.98)" }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              isDisabled={!formData.username || !formData.password || isLoading}
              rightIcon={
                !isLoading ? (
                  <Icon as={RiArrowRightLine} w={3.5} h={3.5} />
                ) : undefined
              }
            >
              {isLoading ? (
                <Spinner size="sm" color="white" />
              ) : (
                "Sign In to Portal"
              )}
            </Button>

            {/* Micro Security & Trust Badges */}
            <HStack justify="center" spacing={2.5} pt={1} opacity={0.85}>
              <HStack spacing={1}>
                <Icon as={RiShieldCheckLine} color="teal.500" boxSize={3} />
                <Text fontSize={{ base: "9.5px", md: "11px" }} fontWeight="700" color="gray.600">
                  256-Bit SSL
                </Text>
              </HStack>
              <Text fontSize="9px" color="gray.300">•</Text>
              <HStack spacing={1}>
                <Icon as={RiSparklingFill} color="cyan.500" boxSize={2.8} />
                <Text fontSize={{ base: "9.5px", md: "11px" }} fontWeight="700" color="gray.600">
                  Instant Sync
                </Text>
              </HStack>
              <Text fontSize="9px" color="gray.300">•</Text>
              <HStack spacing={1}>
                <Icon as={RiHeartPulseLine} color="pink.500" boxSize={3} />
                <Text fontSize={{ base: "9.5px", md: "11px" }} fontWeight="700" color="gray.600">
                  24/7 Care
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Flex>
  );
});

export default Login;
