"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flex, Spinner, Text } from "@chakra-ui/react";

export default function ResetPasswordTokenRedirect({ params }: { params: { token: string } }) {
  const router = useRouter();

  useEffect(() => {
    if (params?.token) {
      router.replace(`/reset-password?token=${params.token}`);
    } else {
      router.replace("/forgot-password");
    }
  }, [params?.token]);

  return (
    <Flex align="center" justify="center" minH="80vh" direction="column" gap={4}>
      <Spinner size="xl" color="teal.500" thickness="4px" />
      <Text color="gray.500" fontSize="md">Redirecting...</Text>
    </Flex>
  );
}
