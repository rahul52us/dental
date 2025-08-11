'use client'

import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../../../../../store/stores";
import BlogForm from "../../BlogForm";
import PageLoader from "../../../../../../component/common/Loader/PageLoader";
import { useParams } from "next/navigation";

const EditBlogForm = observer(() => {
  const [blogData, setBlogData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const {
    BlogStore: { getSingleBlogs, updateBlog },
    auth: { openNotification },
  } = stores;
  const {title} = useParams()

  useEffect(() => {
    if (!title) return;

    const key = {
      title
    };

    setLoading(true);
    getSingleBlogs(key)
      .then((data) => {
        if (data) {
          setBlogData({
            ...data,
            coverImage: {
              fileName: data?.coverImage?.name || null,
              type: data?.coverImage?.type || null,
              buffer: data?.coverImage?.url || null,
              isAdd: 0,
              isDeleted: 0,
            },
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [title, getSingleBlogs]);

  const submitForm = async (submitData: any) => {
    if (!blogData) return;
    setFormLoading(true);

    try {
      const data = await updateBlog({ ...submitData, id: blogData._id });
      openNotification({
        title: "Updated SUCCESSFULLY",
        message: data.message,
      });
      setBlogData({
        ...data?.data,
        coverImage: {
          fileName: data?.coverImage?.name || null,
          type: data?.coverImage?.type || null,
          buffer: data?.coverImage?.url || null,
          isAdd: 0,
          isDeleted: 0,
        },
      });
    } catch (err: any) {
      openNotification({
        title: "UPDATE FAILED",
        message: err.message,
        type: "error",
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <PageLoader height="0vh" noRecordFoundText={!blogData} loading={loading}>
      {blogData && (
        <BlogForm
          initialValues={blogData}
          submitForm={submitForm}
          loading={formLoading}
          isEdit={true}
        />
      )}
    </PageLoader>
  );
});

export default EditBlogForm;
