"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
} from "@chakra-ui/react";
import { Formik, Form as FormikForm } from "formik";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import * as Yup from "yup";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import stores from "../../../../store/stores";
import { status } from "../utils/constant";
import { replaceLabelValueObjects } from "../../../../config/utils/function";

/* -------------------------------------------------
   Validation
------------------------------------------------- */
const RecallAppointmentValidation = Yup.object().shape({
  patient: Yup.object().required("Patient is required"),
  doctor: Yup.object().nullable(),
  appointment: Yup.object().nullable(),
  recallDate: Yup.date().nullable(),
  reason: Yup.string().required("Reason is required"),
  status: Yup.mixed(),
});

const RecallAppointmentForm = observer(
  ({
    isPatient,
    patientDetails,
    onClose,
    initialValues,
    isEdit = false,
    applyGetAllRecords,
    data,
  }: any) => {
    const {
      recallAppointmentStore: {
        createRecallAppointment,
        updateRecallAppointment,
      },
      auth: { openNotification },
    } = stores;
    const [loading, setLoading] = useState(false);

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
                replaceLabelValueObjects({ ...dts, _id: initialValues?._id })
              )
                .then(() => {
                  setLoading(false);
                  openNotification({
                    type: "success",
                    title: "Update SUCCESSFULLY",
                    message: "Recall Appointment has been updated Successfully",
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
                    title: "Failed to update Recall Appointment",
                    message: err?.message,
                  });
                })
                .finally(() => {});
            } else {
              createRecallAppointment(replaceLabelValueObjects(values))
                .then(() => {
                  setLoading(false);

                  openNotification({
                    type: "success",
                    title: "CREATED SUCCESSFULLY",
                    message: "Appointment has been Created Successfully",
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
                    title: "Failed to Create Appointment",
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
          console.log(errors);
          return (
            <FormikForm onSubmit={handleSubmit}>
              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={6}
                mb={6}
                p={4}
              >
                <GridItem colSpan={2}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {/* 👤 Patient */}
                    <CustomInput
                      name="patient"
                      label="Patient"
                      type="real-time-user-search"
                      placeholder="Search Patient"
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

                    <CustomInput
                      name="doctor"
                      label="Doctor"
                      type="real-time-user-search"
                      placeholder="Assign Doctor"
                      value={values.doctor}
                      options={values?.doctor ? [values.doctor] : []}
                      onChange={(val: any) => setFieldValue("doctor", val)}
                      error={errors.doctor}
                      showError={touched.doctor}
                      query={{ type: "doctor" }}
                    />

                    {/* 📅 Recall Date */}
                    <CustomInput
                      name="recallDate"
                      label="Recall Date"
                      type="date"
                      value={values.recallDate}
                      onChange={handleChange}
                      error={errors.recallDate}
                      showError={touched.recallDate}
                    />

                    {/* 📎 Appointment (Optional) */}
                    <CustomInput
                      name="appointment"
                      label="Related Appointment"
                      type="text"
                      placeholder="Link Appointment"
                      value={values.appointment}
                      onChange={(val: any) => setFieldValue("appointment", val)}
                      parentStyle={{ display: "none" }}
                      error={errors.appointment}
                      showError={touched.appointment}
                    />

                    {/* 🔄 Status (Edit only) */}
                    <CustomInput
                      name="status"
                      label="Status"
                      type="select"
                      options={status}
                      value={values.status}
                      onChange={(val: any) => setFieldValue("status", val)}
                    />

                    {/* 📝 Reason */}
                    <Box gridColumn="span 2">
                      <CustomInput
                        label="Reason"
                        name="reason"
                        type="textarea"
                        placeholder="Enter recall reason"
                        required
                        value={values.reason}
                        onChange={handleChange}
                        error={errors.reason}
                        showError={touched.reason}
                      />
                    </Box>
                  </SimpleGrid>
                </GridItem>
              </Grid>

              {/* 🔘 Actions */}
              <Flex justifyContent="flex-end" mt={4}>
                <Flex gap={4}>
                  <Button
                    style={{ backgroundColor: "red" }}
                    colorScheme="red"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                  <Button type="submit" colorScheme="teal" isLoading={loading}>
                    Save
                  </Button>
                </Flex>
              </Flex>
            </FormikForm>
          );
        }}
      </Formik>
    );
  }
);

export default RecallAppointmentForm;