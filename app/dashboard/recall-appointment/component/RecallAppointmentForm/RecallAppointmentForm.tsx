"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import * as Yup from "yup";
import { format } from "date-fns";
import { useEffect } from "react";
import stores from "../../../../store/stores";
import { status } from "../utils/constant";
import { replaceLabelValueObjects } from "../../../../config/utils/function";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

/* -------------------------------------------------
   Validation
------------------------------------------------- */
const RecallAppointmentValidation = Yup.object().shape({
  patient: Yup.object().required(i18next.t("recall.form.patientRequired")),
  doctor: Yup.object().nullable(),
  appointment: Yup.object().nullable(),
  recallDate: Yup.date().nullable(),
  reason: Yup.string().required(i18next.t("recall.form.reasonRequired")),
  status: Yup.mixed(),
  startTime: Yup.string().nullable(),
  endTime: Yup.string().nullable(),
});

const RecallAppointmentForm = observer(
  ({
    isPatient,
    patientDetails,
    onClose,
    initialValues,
    isEdit = false,
    applyGetAllRecords,
    setOpenReportModal,
    haveAppointmentDetails,
    autofillData
  }: any) => {
    const {
      recallAppointmentStore: {
        createRecallAppointment,
        updateRecallAppointment,
      },
      auth: { openNotification },
    } = stores;
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const cardBg = useColorModeValue("white", "darkBrand.100");
    const borderColor = useColorModeValue("gray.200", "darkBrand.200");

    return (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={RecallAppointmentValidation}
        onSubmit={async (values, { resetForm }) => {
          try {
            setLoading(true);
            if (isEdit) {
              let dts = values
              delete dts.createdBy
              delete dts.company
              updateRecallAppointment(
                replaceLabelValueObjects({ ...dts, _id: initialValues?._id, appointment : haveAppointmentDetails?._id })
              )
                .then(() => {
                  setLoading(false);
                  openNotification({
                    type: "success",
                    title: t("recall.form.updateSuccessfully"),
                    message: t("recall.form.updateMessage"),
                  });
                  if (onClose && applyGetAllRecords) {
                    applyGetAllRecords({});
                    resetForm();
                    onClose();
                  }
                })
                .catch((err) => {
                  setLoading(false);
                  openNotification({
                    type: "error",
                    title: t("recall.form.failedToUpdate"),
                    message: err?.message,
                  });
                })
                .finally(() => {});
            } else {
              createRecallAppointment(replaceLabelValueObjects({...values,appointment : haveAppointmentDetails?._id}))
                .then(() => {
                  setLoading(false);

                  openNotification({
                    type: "success",
                    title: t("recall.form.createdSuccessfully"),
                    message: t("recall.form.createMessage"),
                  });
                  if (onClose && applyGetAllRecords) {
                    applyGetAllRecords({});
                    resetForm();
                    onClose();
                  }
                })
                .catch((err) => {
                  setLoading(false);
                  openNotification({
                    type: "error",
                    title: t("recall.form.failedToCreate"),
                    message: err?.message,
                  });
                })
                .finally(() => {});
            }
          } catch (err: any) {
            openNotification?.({
              type: "error",
              title: "Failed",
              message: err?.message || "Something went wrong",
            });
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
        }: any) => {

          // Listen for autofillData changes
          useEffect(() => {
            console.log("Autofill Data Received:", autofillData);
            if (autofillData) {
                if(autofillData.appointmentDate) {
                    setFieldValue("appointmentDate", format(new Date(autofillData.appointmentDate), "yyyy-MM-dd"));
                }
                if(autofillData.startTime) {
                    console.log("Setting startTime:", autofillData.startTime);
                    setFieldValue("startTime", autofillData.startTime);
                }
                if(autofillData.endTime) {
                    setFieldValue("endTime", autofillData.endTime);
                }
                // Optional: set doctor or chair if provided
                 if(autofillData.doctor) {
                    // setFieldValue("doctor", autofillData.doctor);
                 }
            }
          }, [autofillData, setFieldValue]);

          return (
            <FormikForm onSubmit={handleSubmit}>
  <Box
    bg={cardBg}
    border="1px solid"
    borderColor={borderColor}
    borderRadius={{ base: "none", md: "xl" }}
    boxShadow={{ base: "none", md: "sm" }}
    p={{ base: 3, md: 6 }}
  >
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
      {/* -------- Patient & Doctor -------- */}
      <Box>
        <CustomInput
          name="patient"
          label={t("recall.form.patient")}
          type="real-time-user-search"
          placeholder={t("recall.form.searchPatient")}
          required
          value={values.patient}
          onChange={(val: any) => setFieldValue("patient", val)}
          options={
            isPatient
              ? [
                  {
                    label: `${patientDetails?.name} (${patientDetails?.code})`,
                    value: patientDetails?._id,
                  },
                ]
              : values?.patient
              ? [values.patient]
              : []
          }
          error={errors.patient}
          showError={touched.patient}
          query={{ type: "patient" }}
        />
      </Box>

      <Box>
        <CustomInput
          name="doctor"
          label={t("recall.form.doctor")}
          type="real-time-user-search"
          placeholder={t("recall.form.assignDoctor")}
          value={values.doctor}
          options={values?.doctor ? [values.doctor] : []}
          onChange={(val: any) => setFieldValue("doctor", val)}
          error={errors.doctor}
          showError={touched.doctor}
          query={{ type: "doctor" }}
        />
      </Box>

      {/* -------- Dates -------- */}
      <Box>
        <CustomInput
          name="recallDate"
          label={t("recall.form.recallDate")}
          type="date"
          value={values.recallDate}
          onChange={handleChange}
          error={errors.recallDate}
          showError={touched.recallDate}
        />
      </Box>

      <Box>
        <CustomInput
          name="appointmentDate"
          label={t("recall.form.appointmentDate")}
          type="date"
          placeholder={t("recall.form.appointmentDate")}
          value={values.appointmentDate}
          onChange={handleChange}
        />
      </Box>

      {/* -------- Status -------- */}
      <Box>
        <CustomInput
          name="status"
          label={t("recall.form.status")}
          type="select"
          options={status}
          value={values.status}
          onChange={(val: any) => setFieldValue("status", val)}
        />
      </Box>

      {/* -------- Action Button -------- */}
      {values.patient && values?.appointmentDate && (
        <Flex align="flex-end">
          <Button
            colorScheme="blue"
            variant="outline"
            width="100%"
            onClick={() => setOpenReportModal(values)}
          >
            {t("recall.form.showAppointment")}
          </Button>
        </Flex>
      )}

      {/* -------- Reason -------- */}
      <Box gridColumn={{ base: "span 1", md: "span 2" }}>
        <CustomInput
          label={t("recall.form.reason")}
          name="reason"
          type="textarea"
          placeholder={t("recall.form.enterReason")}
          required
          value={values.reason}
          onChange={handleChange}
          error={errors.reason}
          showError={touched.reason}
        />
      </Box>
    </SimpleGrid>

    {/* -------- Footer Actions -------- */}
    <Flex
      direction={{ base: "column-reverse", sm: "row" }}
      justify="flex-end"
      gap={3}
      mt={6}
      pt={4}
      borderTop="1px solid"
      borderColor="gray.100"
    >
      <Button variant="ghost" onClick={onClose} w={{ base: "100%", sm: "auto" }}>
        {t("recall.form.cancel")}
      </Button>
      <Button
        type="submit"
        color="white"
        bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0C4A6E) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
        _hover={{ bgGradient: "linear(135deg, var(--chakra-colors-custom-dark-primary, #082F49) 0%, var(--chakra-colors-custom-light-primary, #0F766E) 100%)" }}
        _active={{ transform: "scale(0.98)" }}
        borderRadius="xl"
        fontWeight="700"
        isLoading={loading}
        w={{ base: "100%", sm: "auto" }}
      >
        {isEdit ? t("recall.form.updateRecall") : t("recall.form.createRecall")}
      </Button>
    </Flex>
  </Box>
</FormikForm>

          );
        }}
      </Formik>
    );
  }
);

export default RecallAppointmentForm;