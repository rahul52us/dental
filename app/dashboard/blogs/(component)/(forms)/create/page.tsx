'use client'
import { Box } from "@chakra-ui/react";
import { useState } from "react";
import stores from "../../../../../store/stores";
import BlogForm from "../BlogForm";
import { blogInitialValues } from "../../utils/constant";

const AddBlogForm = () => {
  const {
    BlogStore: { createBlog },
    auth: { openNotification },
  } = stores;
  const [loading, setLoading] = useState(false);

  const [initialValues, setInitialValues] = useState<any>(blogInitialValues);

  const submitForm = (submitData: any) => {
    setLoading(true);
    createBlog(submitData)
      .then((data) => {
        openNotification({
          title: "CREATED SUCCESSFULLY",
          message: data.message,
        });
        setInitialValues(blogInitialValues);
      })
      .catch((err: any) => {
        openNotification({
          title: "CREATE FAILED",
          message: err.message,
          type: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <Box>
      <BlogForm
        initialValues={initialValues}
        submitForm={submitForm}
        loading={loading}
      />
    </Box>
  );
};

export default AddBlogForm;
