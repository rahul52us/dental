'use client'
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { Box, Flex, Spinner, Text, Grid } from "@chakra-ui/react";
import stores from "../../store/stores";
import { getStatusType } from "../../config/utils/function";
import BlogWidget from "./(component)/BlogWidget";

const BlogsLayout = observer(() => {
  const {
    auth: { openNotification },
    BlogStore: { getBlogs, blogs },
  } = stores;


  const fetchBlogsDetails = useCallback(() => {
    getBlogs({ page: 1, limit: 10 })
      .catch((err: any) => {
        openNotification({
          title: "Failed to Retrieve Blogs",
          message: err?.data?.message,
          type: getStatusType(err.status),
        });
      });
  }, [openNotification, getBlogs]);

  useEffect(() => {
    fetchBlogsDetails();
  }, [fetchBlogsDetails]);



  return (
    <Box py={8} px={6}>
      {/* Blog Cards Section */}
      {blogs.loading ? (
        <Flex justify="center" align="center" py={12}>
          <Spinner size="lg" />
        </Flex>
      ) : blogs.data?.length ? (
        <Grid templateColumns={{ base: "1fr", sm: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }} gap={5}>
          {blogs.data.map((item: any, index: number) => (
            <BlogWidget blog={item} key={index} fetchBlogsDetails={fetchBlogsDetails} />
          ))}
        </Grid>
      ) : (
        <Flex justify="center" align="center" py={12}>
          <Text fontSize="lg" fontWeight="bold" color="gray.500">
            No Blogs Found
          </Text>
        </Flex>
      )}

      {/* Pagination Section */}
      {/* <Flex justifyContent="center" mt={8} display={blogs.data?.length ? "flex" : "none"}>
        <MainPagePagination
        //   currentPage={currentPage}
        //   onPageChange={handlePageChange}
          totalPages={blogs.TotalPages}
        />
      </Flex> */}
    </Box>
  );
});

export default BlogsLayout;
