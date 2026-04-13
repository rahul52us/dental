"use client";
import React from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import FormModel from "../../../component/common/FormModel/FormModel";

const DeleteData = ({ isOpen, onClose, handleDeleteData, data, loading }: any) => {
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.900", "white");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");

  return (
    <FormModel
      isCentered
      open={isOpen}
      close={onClose}
      title="Confirm Delete"
      size="md"
    >
      <Box p={8} textAlign="center">
        <Text mb={3} fontSize="lg" fontWeight="medium" color={textColor}>
          Are you sure you want to{" "}
          <Text as="span" fontWeight="bold" color="red.500">
            Delete
          </Text>{" "}
          <Text as="span" fontWeight="bold">
            {data?.labDoctorName || "this record"}
          </Text>
          ?
        </Text>
        <Text fontSize="sm" color={subtitleColor}>
          This action will permanently remove the record. This cannot be undone.
        </Text>
      </Box>

      <Flex
        justify="space-between"
        align="center"
        p={4}
        borderTopWidth="1px"
        borderColor={borderColor}
        bg={useColorModeValue("gray.50", "whiteAlpha.50")}
        borderBottomRadius="md"
      >
        <Button
          variant="ghost"
          onClick={onClose}
          color={subtitleColor}
          borderRadius="full"
          fontWeight="medium"
          isDisabled={loading}
        >
          Cancel
        </Button>
        <HStack spacing={3}>
          <Button
            colorScheme="red"
            onClick={() => handleDeleteData(false)}
            borderRadius="full"
            fontWeight="bold"
            px={8}
            isLoading={loading}
            shadow="md"
            _hover={{
              shadow: "lg",
              transform: "translateY(-1px)",
            }}
          >
            Delete
          </Button>
        </HStack>
      </Flex>
    </FormModel>
  );
};

export default DeleteData;
