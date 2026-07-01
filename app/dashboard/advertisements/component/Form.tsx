import React, { useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Switch,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import moment from "moment";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import ShowFileUploadFile from "../../../component/common/ShowFileUploadFile/ShowFileUploadFile";
import { removeDataByIndex } from "../../../config/utils/utils";

const AdvertisementSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  link: Yup.string().url("Must be a valid URL").nullable(),
  validFrom: Yup.date().required("Valid From is required"),
  validTo: Yup.date()
    .required("Valid To is required")
    .min(Yup.ref("validFrom"), "Valid To cannot be before Valid From"),
  status: Yup.boolean(),
});

interface AdvertisementFormProps {
  initialData?: any;
  onSubmit: (values: any) => void;
  isLoading: boolean;
  thumbnail: any[];
  setThumbnail: (file: any) => void;
}

const AdvertisementForm: React.FC<AdvertisementFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  thumbnail,
  setThumbnail,
}) => {
  useEffect(() => {
    if (initialData?.image?.url) {
      setThumbnail([
        {
          preview: initialData.image.url,
          name: initialData.image.name,
        },
      ]);
    } else {
      setThumbnail([]);
    }
  }, [initialData, setThumbnail]);

  return (
    <Formik
      initialValues={{
        title: initialData?.title || "",
        link: initialData?.link || "",
        validFrom: initialData?.validFrom
          ? moment(initialData.validFrom).format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
        validTo: initialData?.validTo
          ? moment(initialData.validTo).format("YYYY-MM-DD")
          : moment().add(7, "days").format("YYYY-MM-DD"),
        status: initialData?.status ?? true,
      }}
      validationSchema={AdvertisementSchema}
      onSubmit={(values) => {
        const payload = {
          ...values,
          image: thumbnail.length > 0 ? thumbnail[0] : null,
        };
        onSubmit(payload);
      }}
      enableReinitialize
    >
      {({ errors, touched, setFieldValue, values }) => (
        <Form>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!(errors.title && touched.title)}>
              <FormLabel>Title *</FormLabel>
              <Field as={Input} name="title" placeholder="Advertisement Title" />
              <FormErrorMessage>{errors.title as string}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Image</FormLabel>
              {thumbnail?.length === 0 ? (
                <CustomInput
                  type="file-drag"
                  name="image"
                  value={thumbnail}
                  isMulti={false}
                  accept="image/*"
                  onChange={(e: any) => {
                    setThumbnail([{
                      file: e.target.files[0],
                      name: e.target.files[0].name,
                      isAdd: 1,
                    }]);
                  }}
                />
              ) : (
                <Box mt={-5} bg="#f1f5f9" borderRadius="md" p={2} border="1px dashed #cbd5e1">
                  <ShowFileUploadFile
                    files={thumbnail}
                    removeFile={() => {
                      setThumbnail([]);
                    }}
                    edit={true}
                  />
                </Box>
              )}
            </FormControl>

            <FormControl isInvalid={!!(errors.link && touched.link)}>
              <FormLabel>Link URL</FormLabel>
              <Field as={Input} name="link" placeholder="https://example.com" />
              <FormErrorMessage>{errors.link as string}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!(errors.validFrom && touched.validFrom)}>
              <FormLabel>Valid From *</FormLabel>
              <Field as={Input} type="date" name="validFrom" />
              <FormErrorMessage>{errors.validFrom as string}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!(errors.validTo && touched.validTo)}>
              <FormLabel>Valid To *</FormLabel>
              <Field as={Input} type="date" name="validTo" />
              <FormErrorMessage>{errors.validTo as string}</FormErrorMessage>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="status" mb="0">
                Active Status
              </FormLabel>
              <Switch
                id="status"
                isChecked={values.status}
                onChange={(e) => setFieldValue("status", e.target.checked)}
                colorScheme="green"
              />
            </FormControl>

            <Button
              mt={4}
              colorScheme="teal"
              isLoading={isLoading}
              type="submit"
            >
              Submit
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default AdvertisementForm;
