"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { FaHome, FaPlus, FaProjectDiagram, FaTasks, FaUsers } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import stores from "../../store/stores";
import SummaryWidget from "../../component/common/WigdetCard/SummaryWidget";
import BlogsLayout from "./BlogsLayout";

interface BlogCounts {
  privateBlogs: number;
  publicBlogs: number;
  deletedBlogs: number;
}

const BlogIndex = observer(() => {
  const [loading, setLoading] = useState<boolean>(false);
  const [countData, setCountData] = useState<BlogCounts>({
    privateBlogs: 0,
    publicBlogs: 0,
    deletedBlogs: 0,
  });

  const {
    BlogStore: { getStatusCount },
  } = stores;

  const router = useRouter();
  const showIconOnly = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    setLoading(true);
    getStatusCount({})
      .then((data: any) => {
        setCountData(data?.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getStatusCount]);

  const summaryData = [
    {
      label: "Public Blogs",
      value: countData?.publicBlogs,
      icon: FaProjectDiagram,
      colorScheme: "teal",
      description: "Total number of public blogs.",
      loading: loading,
    },
    {
      label: "Private Blogs",
      value: countData?.privateBlogs,
      icon: FaTasks,
      colorScheme: "blue",
      description: "Total number of private blogs.",
      loading: loading,
    },
    {
      label: "Inactive Blogs",
      value: countData?.deletedBlogs,
      icon: FaUsers,
      colorScheme: "purple",
      description: "Total number of deleted blogs.",
      loading: loading,
    },
  ];

  return (
    <Box
      p={{ base: 6, md: 8 }}
      bg="gray.50"
      borderRadius="lg"
      boxShadow="lg"
      minH="100vh"
    >
      {/* Header Section */}
      <Flex
        justify="space-between"
        align="center"
        mb={{ base: 6, md: 8 }}
        flexWrap="wrap"
        gap={4}
      >
        <Heading
          as="h1"
          display="flex"
          alignItems="center"
          fontSize={{ base: "2xl", md: "3xl" }}
          color="teal.700"
          fontWeight="bold"
        >
          <Icon as={FaHome} boxSize={{ base: 6, md: 8 }} mr={3} />
          Blogs
        </Heading>

        <Box>
          {showIconOnly ? (
            <IconButton
              aria-label="Create Blog"
              icon={<FaPlus />}
              colorScheme="teal"
              size="lg"
              variant="solid"
              borderRadius="full"
              onClick={() => router.push("/dashboard/blogs/create")}
              _hover={{ bg: "teal.600" }}
              _active={{ bg: "teal.700" }}
            />
          ) : (
            <Button
              leftIcon={<FaPlus />}
              colorScheme="teal"
              variant="solid"
              size="lg"
              px={6}
              fontWeight="semibold"
              borderRadius="md"
              _hover={{ bg: "teal.600" }}
              _active={{ bg: "teal.700" }}
              _focus={{ boxShadow: "outline" }}
              onClick={() => router.push("/dashboard/blogs/create")}
            >
              Create Blog
            </Button>
          )}
        </Box>
      </Flex>

      {/* Summary Widgets */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6} mb={8}>
        {summaryData.map((data, index) => (
          <SummaryWidget
            key={index}
            label={data.label}
            value={data.value}
            icon={data.icon}
            colorScheme={data.colorScheme}
            description={data.description}
            loading={data.loading}
          />
        ))}
      </SimpleGrid>

      {/* Blogs Layout */}
      <Box p={6} bg="white" borderRadius="lg" boxShadow="sm">
        <BlogsLayout />
      </Box>
    </Box>
  );
});

export default BlogIndex;