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
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useState } from "react";
import {
  RiArrowRightLine,
  RiEyeLine,
  RiEyeOffLine,
  RiHeartPulseLine,
  RiLockPasswordLine,
  RiShieldCheckLine,
  RiMailLine,
  RiUserSmileLine,
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
    loginType: "code",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const isEmail = formData.loginType === "email";

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleLoginType = (type: "email" | "code") => {
    setFormData((previous) => ({ ...previous, loginType: type }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData);
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
    h: { base: "44px", md: "54px" },
    bg: "#F8FAFC",
    border: "1px solid",
    borderColor: "#E3EAE9",
    borderRadius: "14px",
    color: "#183438",
    fontSize: "sm",
    fontWeight: "600",
    _hover: { borderColor: "#BCD5D1", bg: "white" },
    _focus: {
      borderColor: "#16877D",
      bg: "white",
      boxShadow: "0 0 0 3px rgba(22, 135, 125, 0.12)",
    },
    _placeholder: { color: "#9AAEAD", fontWeight: "400" },
    sx: {
      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 100px #F8FAFC inset !important",
        WebkitTextFillColor: "#183438",
        transition: "background-color 5000s ease-in-out 0s",
      },
    },
  };

  return (
    <VStack spacing={0} align="stretch" w="100%">
      <Box mb={{ base: 2, md: 7 }} textAlign={{ base: "center", md: "left" }}>
        <Text
          display={{ base: "none", md: "block" }}
          color="#16877D"
          fontSize="10px"
          fontWeight="800"
          letterSpacing="1.6px"
          textTransform="uppercase"
          mb={2}
        >
          YOUR PRACTICE PORTAL
        </Text>
        <Heading
          color="#17363A"
          fontSize={{ base: "24px", md: "34px" }}
          fontWeight="800"
          letterSpacing="-1.1px"
          lineHeight="1.1"
        >
          Good to see you.
        </Heading>
        <Text
          color="#718483"
          fontSize={{ base: "xs", md: "sm" }}
          mt={{ base: 1, md: 2 }}
        >
          Sign in to pick up right where you left off.
        </Text>
      </Box>

      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <VStack spacing={{ base: 2, md: 5 }} align="stretch">
          <Box
            p="5px"
            bg="#F2F6F5"
            border="1px solid"
            borderColor="#E7EFED"
            rounded="16px"
          >
            <HStack spacing={1}>
              {[
                {
                  value: "code" as const,
                  label: "User code",
                  icon: RiUserSmileLine,
                },
                {
                  value: "email" as const,
                  label: "Email address",
                  icon: RiMailLine,
                },
              ].map(({ value, label, icon }) => {
                const active = formData.loginType === value;

                return (
                  <Button
                    key={value}
                    type="button"
                    flex={1}
                    h={{ base: "38px", md: "42px" }}
                    px={2}
                    rounded="12px"
                    bg={active ? "white" : "transparent"}
                    color={active ? "#1A4E4C" : "#7C9290"}
                    fontSize={{ base: "xs", sm: "sm" }}
                    fontWeight={active ? "700" : "600"}
                    boxShadow={
                      active ? "0 2px 8px rgba(26, 78, 76, 0.09)" : "none"
                    }
                    leftIcon={<Icon as={icon} boxSize={4} />}
                    _hover={{
                      bg: active ? "white" : "rgba(255,255,255,0.65)",
                    }}
                    onClick={() => handleLoginType(value)}
                  >
                    {label}
                  </Button>
                );
              })}
            </HStack>
          </Box>

          <FormControl isRequired>
            <FormLabel
              color="#345354"
              fontSize="xs"
              fontWeight="700"
              mb={2}
            >
              {isEmail ? "Email address" : "User code"}
            </FormLabel>
            <InputGroup>
              <InputLeftElement
                h={{ base: "44px", md: "54px" }}
                w="48px"
                pointerEvents="none"
              >
                <Icon
                  as={isEmail ? RiMailLine : RiUserSmileLine}
                  boxSize={4}
                  color="#16877D"
                />
              </InputLeftElement>
              <Input
                {...inputStyle}
                type={isEmail ? "email" : "text"}
                name="username"
                autoComplete={isEmail ? "email" : "username"}
                placeholder={
                  isEmail ? "you@yourpractice.com" : "e.g. USR-9042"
                }
                value={formData.username}
                onChange={handleInputChange}
                pl="48px"
                required
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <Flex justify="space-between" align="center" mb={2}>
              <FormLabel
                color="#345354"
                fontSize="xs"
                fontWeight="700"
                mb={0}
              >
                Password
              </FormLabel>
              <Link href="/forgot-password">
                <Text
                  color="#16877D"
                  fontSize="xs"
                  fontWeight="700"
                  _hover={{ color: "#106E66", textDecoration: "underline" }}
                >
                  Forgot password?
                </Text>
              </Link>
            </Flex>
            <InputGroup>
              <InputLeftElement
                h={{ base: "44px", md: "54px" }}
                w="48px"
                pointerEvents="none"
              >
                <Icon as={RiLockPasswordLine} boxSize={4} color="#16877D" />
              </InputLeftElement>
              <Input
                {...inputStyle}
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                pl="48px"
                pr="52px"
                required
              />
              <InputRightElement h={{ base: "44px", md: "54px" }} w="48px">
                <IconButton
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={
                    <Icon
                      as={showPassword ? RiEyeOffLine : RiEyeLine}
                      boxSize={4}
                    />
                  }
                  size="sm"
                  variant="ghost"
                  color="#7C9290"
                  rounded="lg"
                  _hover={{ color: "#16877D", bg: "#EAF5F2" }}
                  onClick={() => setShowPassword((previous) => !previous)}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Checkbox
            colorScheme="teal"
            size="sm"
            alignSelf="flex-start"
            iconColor="white"
          >
            <Text color="#718483" fontSize="xs" fontWeight="500">
              Keep me signed in
            </Text>
          </Checkbox>

          <Button
            type="submit"
            h={{ base: "46px", md: "54px" }}
            mt={1}
            rounded="14px"
            bg="#167F76"
            color="white"
            fontSize="sm"
            fontWeight="800"
            letterSpacing="0.15px"
            boxShadow="0 9px 22px rgba(22, 127, 118, 0.2)"
            isDisabled={!formData.username || !formData.password || isLoading}
            rightIcon={
              !isLoading ? <Icon as={RiArrowRightLine} boxSize={4} /> : undefined
            }
            _hover={{
              bg: "#126D66",
              transform: "translateY(-1px)",
              boxShadow: "0 12px 26px rgba(22, 127, 118, 0.26)",
            }}
            _active={{ transform: "translateY(0)" }}
            transition="all 180ms ease"
          >
            {isLoading ? <Spinner size="sm" color="white" /> : "Sign in to portal"}
          </Button>
        </VStack>
      </form>

      <HStack
        justify="center"
        display={{ base: "none", md: "flex" }}
        spacing={5}
        mt={7}
        color="#758A89"
      >
        <HStack spacing={1.5}>
          <Icon as={RiShieldCheckLine} color="#16877D" boxSize={3.5} />
          <Text fontSize="10px" fontWeight="600">
            Secure access
          </Text>
        </HStack>
        <Box w="3px" h="3px" rounded="full" bg="#C6D3D1" />
        <HStack spacing={1.5}>
          <Icon as={RiHeartPulseLine} color="#16877D" boxSize={3.5} />
          <Text fontSize="10px" fontWeight="600">
            Patient-first care
          </Text>
        </HStack>
      </HStack>
    </VStack>
  );
});

export default Login;
