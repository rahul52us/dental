"use client";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useState } from "react";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiMailLine,
  RiUserLine,
  RiLockLine,
} from "react-icons/ri";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";

const Login = observer(() => {
  const {
    auth: { login, openNotification },
  } = stores;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    loginType: "code", // username | email | code
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

  return (
    <Flex direction="column" justify="center" w="100%" maxW="400px" mx="auto">
      <VStack spacing={{ base: 5, md: 6 }} align="stretch" w="100%">
        {/* Header */}
        <Box>
          <Heading
            size={{ base: "md", md: "lg" }}
            color="gray.800"
            fontWeight="extrabold"
            lineHeight="1.2"
          >
            Welcome Back
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {isEmail
              ? "Sign in with your email address"
              : "Sign in with your user code"}
          </Text>
        </Box>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={{ base: 4, md: 5 }} align="stretch" w="100%">
            {/* Login type — segmented pill toggle */}
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                mb={2}
              >
                Login Using
              </Text>
              <HStack spacing={1.5} p={1} bg="gray.100" rounded="2xl">
                <Button
                  flex={1}
                  height="38px"
                  rounded="xl"
                  bg={!isEmail ? "white" : "transparent"}
                  color={!isEmail ? "teal.600" : "gray.500"}
                  fontWeight="700"
                  fontSize="sm"
                  boxShadow={!isEmail ? "sm" : "none"}
                  _hover={{ bg: !isEmail ? "white" : "gray.200" }}
                  onClick={() => handleLoginType("code")}
                  leftIcon={<RiUserLine size={16} />}
                >
                  User Code
                </Button>
                <Button
                  flex={1}
                  height="38px"
                  rounded="xl"
                  bg={isEmail ? "white" : "transparent"}
                  color={isEmail ? "teal.600" : "gray.500"}
                  fontWeight="700"
                  fontSize="sm"
                  boxShadow={isEmail ? "sm" : "none"}
                  _hover={{ bg: isEmail ? "white" : "gray.200" }}
                  onClick={() => handleLoginType("email")}
                  leftIcon={<RiMailLine size={16} />}
                >
                  Email
                </Button>
              </HStack>
            </Box>

            {/* Username / Email / User code */}
            <FormControl>
              <InputGroup size="lg">
                <InputLeftElement h="full" pointerEvents="none" color="gray.400">
                  {isEmail ? <RiMailLine size={20} /> : <RiUserLine size={20} />}
                </InputLeftElement>
                <Input
                  type="text"
                  name="username"
                  placeholder={
                    isEmail ? "Enter your email" : "Enter your user code"
                  }
                  value={formData.username}
                  onChange={handleInputChange}
                  height={{ base: "48px", md: "50px" }}
                  variant="filled"
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                  _focus={{
                    bg: "white",
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 1px #319795",
                  }}
                  rounded="xl"
                  required
                  pl={12}
                />
              </InputGroup>
            </FormControl>

            {/* Password */}
            <FormControl>
              <InputGroup size="lg">
                <InputLeftElement h="full" pointerEvents="none" color="gray.400">
                  <RiLockLine size={20} />
                </InputLeftElement>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  height={{ base: "48px", md: "50px" }}
                  variant="filled"
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                  _focus={{
                    bg: "white",
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 1px #319795",
                  }}
                  rounded="xl"
                  required
                  pl={12}
                />
                <InputRightElement
                  h="full"
                  cursor="pointer"
                  onClick={handleTogglePassword}
                  color="gray.400"
                  _hover={{ color: "teal.500" }}
                >
                  {showPassword ? (
                    <RiEyeOffLine size={20} />
                  ) : (
                    <RiEyeLine size={20} />
                  )}
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {/* Remember / Forgot */}
            <Flex justify="space-between" align="center">
              <Checkbox colorScheme="teal" size="sm">
                <Text fontSize="xs" color="gray.600" fontWeight="600">
                  Remember me
                </Text>
              </Checkbox>
              <Link href="/forgot-password">
                <Text
                  fontSize="xs"
                  color="teal.600"
                  fontWeight="700"
                  _hover={{ textDecoration: "underline" }}
                >
                  Forgot Password?
                </Text>
              </Link>
            </Flex>

            {/* Submit */}
            <Button
              size="lg"
              width="100%"
              type="submit"
              height={{ base: "48px", md: "52px" }}
              rounded="xl"
              bgGradient="linear(to-r, teal.400, blue.500)"
              color="white"
              fontWeight="800"
              fontSize="md"
              boxShadow="0 8px 20px rgba(49,151,149,0.35)"
              _hover={{
                bgGradient: "linear(to-r, teal.500, blue.600)",
                transform: "translateY(-1px)",
                boxShadow: "0 12px 24px rgba(49,151,149,0.45)",
              }}
              _active={{ transform: "translateY(0)", boxShadow: "md" }}
              transition="all 0.2s"
              isDisabled={!formData.username || !formData.password || isLoading}
            >
              {isLoading ? <Spinner size="sm" color="white" /> : "Sign In"}
            </Button>
          </VStack>
        </form>
      </VStack>
    </Flex>
  );
});

export default Login;