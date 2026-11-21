import { Box, Flex, Heading, Skeleton, Tbody, Td, Tr, VStack } from "@chakra-ui/react";

interface TableLoaderProps {
  loader: boolean;
  show: number;
  children?: React.ReactNode;
}

const TableLoader: React.FC<TableLoaderProps> = ({
  loader,
  show,
  children,
}) => {
  if (loader) {
    return (
      <Tbody>
        {Array.from({ length: 6 }).map((_, idx) => (
          <Tr key={idx}>
            <Td colSpan={12} p={3}>
              <Flex gap={4} align="center">
                <Skeleton h="16px" w="40px" borderRadius="md" />
                <Skeleton h="16px" flex={2} borderRadius="md" />
                <Skeleton h="16px" flex={2} borderRadius="md" />
                <Skeleton h="16px" flex={1} borderRadius="md" />
                <Skeleton h="16px" flex={1} borderRadius="md" />
                <Skeleton h="16px" w="60px" borderRadius="md" />
              </Flex>
            </Td>
          </Tr>
        ))}
      </Tbody>
    );
  }

  if (show === 0) {
    return (
      <Tbody>
        <Tr>
          <Td colSpan={10} p={5}>
            <Flex justifyContent="center">
              <Heading fontSize="sm" color="red.400" cursor="pointer">
                No Related Data are Found
              </Heading>
            </Flex>
          </Td>
        </Tr>
      </Tbody>
    );
  }
  return <>{children}</>;
};

export default TableLoader;
