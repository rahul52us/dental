"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  Spinner,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useState } from "react";
import { FaTooth } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";

const ForgotPassword = observer(() => {
  const {
    auth: { forgotPasswordStore, openNotification },
  } = stores;

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const headingSize = useBreakpointValue({ base: "lg", md: "xl" });
  const cardPadding = useBreakpointValue({ base: 2, md: 3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      return openNotification({
        title: "Validation Error",
        message: "Please enter your email",
        type: "error",
      });
    }

    setIsLoading(true);

    try {
      await forgotPasswordStore({ username: email });

      openNotification({
        title: "Email Sent",
        message: `Reset link has been sent to ${email}. Please check your inbox.`,
        type: "success",
        duration: 4000,
      });

      router.push("/login");
    } catch (error: any) {
      openNotification({
        title: "Failed",
        message: error?.message || error || "Could not send reset link. Please check your email and try again.",
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
              Forgot Password
            </Heading>
            <Text fontSize="md" color="gray.500" mb={4}>
              Enter your email to receive a password reset link
            </Text>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl id="email">
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Email Address
                </FormLabel>
                <Input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                  variant="filled"
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                  _focus={{ bg: "white", borderColor: "teal.500", boxShadow: "0 0 0 1px #319795" }}
                  borderRadius="xl"
                  required
                />
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
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(49, 151, 149, 0.5)",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                isLoading={isLoading}
                loadingText="Sending..."
              >
                Send Reset Link
              </Button>

              <Flex justify="center" mt={4}>
                <Text color="gray.500" fontSize="sm">
                  Remembered your password?{" "}
                  <Link href="/login">
                    <Text as="span" color="teal.600" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
                      Back to Login
                    </Text>
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

export default ForgotPassword;
