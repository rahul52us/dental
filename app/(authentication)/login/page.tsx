"use client";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Spinner,
  VStack,
  Divider,
  useBreakpointValue,
  Select,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { RiEyeLine, RiEyeOffLine, RiUserSmileLine } from "react-icons/ri";
import { FaTooth } from "react-icons/fa";
import CustomButton from "../../component/common/CustomButton/CustomButton";
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
    loginType: "email", // username | email | code
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const headingSize = useBreakpointValue({ base: "lg", md: "xl" });
  const cardPadding = useBreakpointValue({ base: 2, md: 3 });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        message: error.response?.message || "Invalid credentials",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" minH={{ base: "90vh", md: "80vh" }}>
      <Box w="100%" p={cardPadding} borderRadius="xl" animation="fadeIn 0.4s ease">
        <VStack spacing={6} align="stretch">
          {/* Heading */}
          <Box textAlign="center">
            <Flex justify="center" mb={6}>
              <Flex
                align="center"
                justify="center"
                w="90px"
                h="90px"
                bgGradient="linear(to-tr, orange.400, pink.400, purple.500)"
                rounded="full"
                boxShadow="lg"
              >
                <FaTooth size={45} color="white" />
              </Flex>
            </Flex>
            <Heading size={headingSize} mb={2} color="teal.700" fontWeight="extrabold" letterSpacing="tight">
              Welcome Back
            </Heading>
            <Text fontSize="md" color="gray.500" mb={4}>
              Log in to continue to your dashboard
            </Text>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              {/* LOGIN TYPE + USERNAME */}
              <FormControl id="username">
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Login Using
                </FormLabel>

                <Select
                  name="loginType"
                  value={formData.loginType}
                  onChange={handleInputChange}
                  size="lg"
                  mb={3}
                  variant="filled"
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                  _focus={{ bg: "white", borderColor: "teal.500" }}
                  borderRadius="xl"
                >
                  <option value="email">Email</option>
                  <option value="code">User Code</option>
                </Select>

                <Input
                  type="text"
                  name="username"
                  placeholder={
                    formData.loginType === "email"
                      ? "Enter your email"
                      : formData.loginType === "code"
                        ? "Enter your user code"
                        : "Enter your username"
                  }
                  value={formData.username}
                  onChange={handleInputChange}
                  size="lg"
                  variant="filled"
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                  _focus={{ bg: "white", borderColor: "teal.500", boxShadow: "0 0 0 1px #319795" }}
                  borderRadius="xl"
                  required
                />
              </FormControl>

              {/* Password */}
              <FormControl id="password">
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Password
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    variant="filled"
                    bg="gray.50"
                    _hover={{ bg: "gray.100" }}
                    _focus={{ bg: "white", borderColor: "teal.500", boxShadow: "0 0 0 1px #319795" }}
                    borderRadius="xl"
                    required
                  />
                  <InputRightElement
                    cursor="pointer"
                    onClick={handleTogglePassword}
                    color="gray.500"
                    _hover={{ color: "teal.600" }}
                  >
                    {showPassword ? (
                      <RiEyeOffLine size={20} />
                    ) : (
                      <RiEyeLine size={20} />
                    )}
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Flex justify="flex-start" align="center" fontSize="sm" mt={2} mb={2}>
                <Checkbox colorScheme="teal" size="md">
                  <Text color="gray.600" fontWeight="500">Remember me</Text>
                </Checkbox>
              </Flex>

              {/* Sign in button */}
              <Button
                size="lg"
                width="100%"
                type="submit"
                height="56px"
                borderRadius="xl"
                bgGradient="linear(to-r, teal.400, blue.500)"
                color="white"
                fontWeight="bold"
                fontSize="md"
                _hover={{
                  bgGradient: "linear(to-r, teal.500, blue.600)",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "md"
                }}
                transition="all 0.2s"
                isDisabled={
                  !formData.username || !formData.password || isLoading
                }
              >
                {isLoading ? (
                  <Spinner size="sm" color="white" />
                ) : (
                  "Sign in"
                )}
              </Button>

              {/* OR divider */}
              <Flex align="center" gap={2} display="none">
                <Divider />
                <Text fontSize="xs" color="gray.500">
                  OR
                </Text>
                <Divider />
              </Flex>

              {/* Google login */}
              <Button
                size="lg"
                width="100%"
                leftIcon={<FcGoogle size="22px" />}
                fontSize="sm"
                fontWeight="500"
                bg="white"
                color="gray.700"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="full"
                _hover={{ bg: "gray.50" }}
                display="none"
              >
                Sign in with Google
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Flex>
  );
});

export default Login;
