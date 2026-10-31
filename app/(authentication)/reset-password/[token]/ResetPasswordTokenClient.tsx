
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Flex, Spinner, Text } from "@chakra-ui/react";

export default function ResetPasswordTokenClient() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const token = params?.token;

    if (typeof token === "string" && token !== "static") {
      router.replace(
        `/reset-password?token=${encodeURIComponent(token)}`
      );
    } else {
      router.replace("/forgot-password");
    }
  }, [params, router]);

  return (
    <Flex align="center" justify="center" minH="80vh" direction="column" gap={4}>
      <Spinner size="xl" color="teal.500" thickness="4px" />
      <Text color="gray.500" fontSize="md">
        Redirecting...
      </Text>
    </Flex>
  );
}
