"use client";
import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Tag,
  Text,
  useColorModeValue,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { FaTags } from "react-icons/fa";
import { BsFillPersonFill, BsFillTrashFill } from "react-icons/bs";
import { useRouter } from "next/navigation";
import FormModel from "../../../component/common/FormModel/FormModel";
import stores from "../../../store/stores";

interface BlogData {
  _id: string;
  title: string;
  subTitle: string;
  isPrivate: boolean;
  tags: string[];
  comments: any[];
  slug:any;
  coverImage?: {
    url: string;
    alt: string;
  };
  createdBy: {
    pic: {
      name: string;
      url: string;
      type: string;
    };
    _id: string;
    name: string;
    username: string;
    createdAt: string;
  };
  createdAt: string;
  reactions: any[];
}

const BlogWidget: React.FC<{ blog: BlogData; fetchBlogsDetails: any }> = ({ blog, fetchBlogsDetails }) => {
  const { BlogStore: { deleteBlog }, auth: { openNotification } } = stores;
  const navigate = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "white");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const accentColor = "teal.500"; // Unified accent

  const handleDelete = (status: boolean) => {
    setDeleteLoading(true);
    deleteBlog({ id: blog._id, deleted: status })
      .then((data: any) => {
        openNotification({
          title: "Deleted Successfully",
          message: data.message,
        });
        fetchBlogsDetails();
        onClose();
      })
      .catch((err: any) => {
        openNotification({
          title: "Delete Failed",
          message: err.message,
          type: "error",
        });
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      overflow="hidden"
      maxW="md" // Slightly narrower for elegance
      m="auto"
      mb={6}
      transition="all 0.2s ease"
      _hover={{ borderColor: accentColor }}
    >
      {/* Cover Image */}
      <Box h="180px" overflow="hidden">
        {blog?.coverImage?.url ? (
          <Image
            src={blog.coverImage.url}
            alt={blog.coverImage.alt || "Blog Cover"}
            objectFit="cover"
            width="100%"
            height="100%"
            transition="opacity 0.2s ease"
            _hover={{ opacity: 0.9 }}
          />
        ) : (
          <Flex h="100%" justify="center" align="center" bg={borderColor} color={subtitleColor}>
            <Text fontSize="md" fontWeight="medium">No Image</Text>
          </Flex>
        )}
      </Box>

      {/* Content */}
      <Box p={5} fontFamily="Helvetica, Arial, sans-serif">
        <Flex justify="space-between" align="center" mb={3}>
          <Heading
            as="h2"
            size="md"
            fontWeight="semibold"
            color={textColor}
            _hover={{ color: accentColor }}
            cursor="pointer"
            onClick={() => navigate.push(`/dashboard/blogs/edit/${blog.slug}`)} // Add actual path
          >
            {blog?.title}
          </Heading>
          <Tag
            size="sm"
            colorScheme={blog.isPrivate ? "red" : "green"}
            fontWeight="medium"
            borderRadius="full"
            px={2}
          >
            {blog?.isPrivate ? "Private" : "Public"}
          </Tag>
        </Flex>

        <Text
          mb={4}
          color={subtitleColor}
          fontSize="sm"
          lineHeight="short"
          noOfLines={2}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Box as="span" dangerouslySetInnerHTML={{ __html: blog.subTitle }} />
        </Text>

        <HStack spacing={2} wrap="wrap" mb={4}>
          <Icon as={FaTags} color={accentColor} boxSize={4} />
          {blog?.tags?.map((tag) => (
            <Tag
              key={tag}
              size="sm"
              color={accentColor}
              bg="transparent"
              borderWidth="1px"
              borderColor={accentColor}
              borderRadius="full"
              px={2}
              fontWeight="medium"
              transition="all 0.2s ease"
              _hover={{ bg: accentColor, color: "white" }}
            >
              {tag}
            </Tag>
          ))}
        </HStack>
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={BsFillPersonFill} color={accentColor} boxSize={4} />
            <Text fontSize="xs" color={subtitleColor}>
              {new Date(blog?.createdAt).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Text>
          </HStack>
          <Icon
            as={BsFillTrashFill}
            color="red.400"
            boxSize={4}
            cursor="pointer"
            onClick={onOpen}
            _hover={{ color: "red.500" }}
          />
        </Flex>
      </Box>

      {/* Delete Modal */}
      <FormModel isCentered open={isOpen} close={onClose} title="Confirm Delete" size="md">
        <Box p={5} textAlign="center">
          <Text mb={3} fontSize="md" fontWeight="medium" color={textColor}>
            Are you sure you want to{" "}
            <Text as="span" fontWeight="bold" color={isPermanentDelete ? "red.400" : "yellow.600"}>
              {isPermanentDelete ? "permanently delete" : "make inactive"}
            </Text>
            ?
          </Text>
          <Text fontSize="xs" color={subtitleColor}>
            This action cannot be undone.
          </Text>
        </Box>

        <Flex justify="space-between" align="center" p={4} borderTopWidth="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => {
                setIsPermanentDelete(true);
                handleDelete(true);
              }}
              borderRadius="full"
              fontWeight="medium"
              size="sm"
              px={4}
              isLoading={deleteLoading}
              _hover={{ bg: "red.50" }}
            >
              Permanent Delete
            </Button>
            <Button
              colorScheme="yellow"
              variant="outline"
              onClick={() => {
                setIsPermanentDelete(false);
                handleDelete(false);
              }}
              borderRadius="full"
              fontWeight="medium"
              size="sm"
              px={4}
              isLoading={deleteLoading}
              _hover={{ bg: "yellow.50" }}
            >
              Make Inactive
            </Button>
          </HStack>
          <Button
            variant="ghost"
            onClick={onClose}
            color={subtitleColor}
            borderRadius="full"
            fontWeight="medium"
            size="sm"
            px={4}
            _hover={{ bg: "gray.100" }}
          >
            Cancel
          </Button>
        </Flex>
      </FormModel>
    </Box>
  );
};

export default BlogWidget;