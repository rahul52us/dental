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
  Text,
  Spinner,
  VStack,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
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
    loginType: "username",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const headingSize = useBreakpointValue({ base: "lg", md: "xl" });
  const cardPadding = useBreakpointValue({ base: 2, md: 3 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
      router.push("/dashboard");
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
    <Flex align="center" justify="center"
      minH={{base : "90vh", md : '80vh'}}>
      <Box
        w="100%"
        p={cardPadding}
        borderRadius="xl"
        animation="fadeIn 0.4s ease"
      >
        <VStack spacing={6} align="stretch">
          {/* Heading */}
          <Box textAlign="center">
            <Heading size={headingSize} mb={2} color="teal.700">
              Welcome Back
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Log in to continue
            </Text>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl id="username">
                <FormLabel fontSize="sm" fontWeight="500">
                  Username
                </FormLabel>
                <Input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  focusBorderColor="teal.500"
                  size="lg"
                  required
                />
              </FormControl>

              <FormControl id="password">
                <FormLabel fontSize="sm" fontWeight="500">
                  Password
                </FormLabel>
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  focusBorderColor="teal.500"
                  size="lg"
                  required
                />
              </FormControl>

              <Flex justify="space-between" align="center" fontSize="sm">
                <Checkbox colorScheme="teal" size="sm">
                  Remember me
                </Checkbox>
                <Link href="/forgot-password">
                  <Text
                    color="teal.600"
                    fontWeight="500"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Forgot password?
                  </Text>
                </Link>
              </Flex>

              {/* Sign in button */}
              <CustomButton
                size="lg"
                width="100%"
                type="submit"
                mt={2}
                borderRadius="full"
                isDisabled={
                  !formData.username || !formData.password || isLoading
                }
              >
                {isLoading ? <Spinner size="sm" color="white" /> : "Sign in"}
              </CustomButton>

              {/* OR divider */}
              <Flex align="center" gap={2}>
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
              >
                Sign in with Google
              </Button>
            </VStack>
          </form>

          {/* Sign up */}
          <Text display="none" textAlign="center" fontSize="sm" color="gray.600">
            Don’t have an account?{" "}
            <Link href="/register">
              <Text
                as="span"
                color="teal.600"
                fontWeight="500"
                _hover={{ textDecoration: "underline" }}
              >
                Sign up
              </Text>
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
});

export default Login;