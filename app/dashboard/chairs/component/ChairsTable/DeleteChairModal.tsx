import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import FormModel from "../../../../component/common/FormModel/FormModel";
import stores from "../../../../store/stores";

export default function DeleteChairModal({ isOpen, onClose, data, refresh }: any) {
  const { chairsStore, auth: { openNotification } } = stores;

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await chairsStore.deleteChair(data._id);
      openNotification({
        title: "Deleted Successfully",
        message: "Chair deleted successfully",
      });
      refresh();  // refresh table
      onClose();
    } catch (err: any) {
      openNotification({
        title: "Delete Failed",
        message: err?.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModel isCentered open={isOpen} close={onClose} title="Confirm Delete" size="md">
      <Box p={5} textAlign="center">
        <Text mb={3} fontSize="md" fontWeight="medium">
          Are you sure you want to <Text as="span" color="red.400">delete this chair?</Text>
        </Text>
        <Text fontSize="xs" color="gray.500">This action cannot be undone.</Text>
      </Box>
      <HStack
        spacing={3}
        p={4}
        pb={{ base: 6, md: 4 }}
        borderTopWidth="1px"
        w="100%"
      >
        <Button
          variant="outline"
          borderColor="gray.300"
          color="gray.700"
          bg="white"
          _hover={{ bg: "gray.50" }}
          onClick={onClose}
          size="md"
          h="44px"
          flex={1}
          borderRadius="xl"
          fontWeight="600"
        >
          Cancel
        </Button>
        <Button
          colorScheme="red"
          onClick={handleDelete}
          borderRadius="xl"
          size="md"
          h="44px"
          isLoading={loading}
          flex={1}
          fontWeight="700"
          px={6}
        >
          Delete Chair
        </Button>
      </HStack>
    </FormModel>
  );
}
