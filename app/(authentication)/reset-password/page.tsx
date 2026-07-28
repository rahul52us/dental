"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  useBreakpointValue,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useState, Suspense } from "react";
import { FaTooth } from "react-icons/fa";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useRouter, useSearchParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";

const ResetPasswordForm = observer(() => {
  const {
    auth: { resetPasswordStore, openNotification },
  } = stores;

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const headingSize = useBreakpointValue({ base: "lg", md: "xl" });
  const cardPadding = useBreakpointValue({ base: 2, md: 3 });

  if (!token) {
    return (
      <Flex align="center" justify="center" minH={{ base: "90vh", md: "80vh" }}>
        <Box w="100%" p={cardPadding} textAlign="center">
          <Alert status="error" borderRadius="xl" mb={4}>
            <AlertIcon />
            Invalid or missing reset token. Please request a new password reset link.
          </Alert>
          <Link href="/forgot-password">
            <Button colorScheme="teal" borderRadius="xl" mt={4}>
              Request New Link
            </Button>
          </Link>
        </Box>
      </Flex>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return openNotification({
        title: "Validation Error",
        message: "Please fill in all fields",
        type: "error",
      });
    }

    if (password.length < 6) {
      return openNotification({
        title: "Validation Error",
        message: "Password must be at least 6 characters",
        type: "error",
      });
    }

    if (password !== confirmPassword) {
      return openNotification({
        title: "Validation Error",
        message: "Passwords do not match",
        type: "error",
      });
    }

    setIsLoading(true);

    try {
      await resetPasswordStore({ token, password });

      openNotification({
        title: "Password Reset Successful",
        message: "Your password has been reset. You can now log in with your new password.",
        type: "success",
        duration: 4000,
      });

      router.push("/login");
    } catch (error: any) {
      openNotification({
        title: "Reset Failed",
        message: error?.message || error || "Invalid or expired token. Please request a new link.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" minH={{ base: "90vh", md: "80vh" }}>
      <Box w="100%" p={cardPadding} borderRadius="xl">
        <VStack spacing={6} align="stretch">
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
              Reset Password
            </Heading>
            <Text fontSize="md" color="gray.500" mb={4}>
              Enter your new password below
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl id="password">
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">New Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="filled"
                    bg="gray.50"
                    _hover={{ bg: "gray.100" }}
                    _focus={{ bg: "white", borderColor: "teal.500", boxShadow: "0 0 0 1px #319795" }}
                    borderRadius="xl"
                    required
                  />
                  <InputRightElement cursor="pointer" onClick={() => setShowPassword(!showPassword)} color="gray.500" _hover={{ color: "teal.600" }}>
                    {showPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl id="confirmPassword">
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Confirm Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="filled"
                    bg="gray.50"
                    _hover={{ bg: "gray.100" }}
                    _focus={{ bg: "white", borderColor: "teal.500", boxShadow: "0 0 0 1px #319795" }}
                    borderRadius="xl"
                    required
                  />
                  <InputRightElement cursor="pointer" onClick={() => setShowConfirm(!showConfirm)} color="gray.500" _hover={{ color: "teal.600" }}>
                    {showConfirm ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                w="100%"
                mt={4}
                mb={3}
                borderRadius="xl"
                fontWeight="bold"
                boxShadow="0 4px 15px rgba(49, 151, 149, 0.4)"
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(49, 151, 149, 0.5)" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                isLoading={isLoading}
                loadingText="Resetting..."
              >
                Reset Password
              </Button>

              <Flex justify="center" mt={2}>
                <Text color="gray.500" fontSize="sm">
                  Back to{" "}
                  <Link href="/login">
                    <Text as="span" color="teal.600" fontWeight="bold" _hover={{ textDecoration: "underline" }}>Login</Text>
                  </Link>
                </Text>
              </Flex>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Flex>
  );
});

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Flex align="center" justify="center" minH="80vh"><Text>Loading...</Text></Flex>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
