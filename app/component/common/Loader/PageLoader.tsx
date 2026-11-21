import { Center, Flex, Box, Text, Icon } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { PageSkeleton } from "./ContentSkeleton";
import { FaExclamationTriangle } from "react-icons/fa";

// it handle loader and it's children for the drawer
const PageLoader = observer(
  ({
    loading,
    children,
    noRecordFoundText = false,
    height="40vh"
  }: {
    loading?: boolean;
    children: React.ReactNode;
    noRecordFoundText?: boolean;
    height?:any
  }) => {
    return (
      <>
        {loading ? (
          <PageSkeleton />
        ) : noRecordFoundText ? (
          <Center height="100%" mb={'20vh'}>
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
            >
              <Box
                p={8}
                mt={height}
                borderRadius="md"
              >
                <Icon as={FaExclamationTriangle} w={12} h={12} color="red.400" />
                <Text mt={4} fontSize="xl" fontWeight="bold" color="gray.700">
                  No Records Found
                </Text>
                <Text mt={2} fontSize="md" color="gray.500">
                  Please try again later or contact support if the issue persists.
                </Text>
              </Box>
            </Flex>
          </Center>
        ) : (
          <>{children}</>
        )}
      </>
    );
  }
);

export default PageLoader;
