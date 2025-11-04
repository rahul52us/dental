"use client";
import React, { useMemo } from "react";
import {
  VStack,
  HStack,
  Button,
  Switch,
  FormLabel,
  FormControl,
  Box,
  Text,
  SimpleGrid,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Divider,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import { replaceLabelValueObjects } from "../../../config/utils/function";
import { appointStatus } from "../constant";

const validationSchema = Yup.object().shape({
  primaryDoctor: Yup.mixed().required("Primary doctor is required"),
  patient: Yup.mixed().required("Patient is required"),
  appointmentDate: Yup.string().required("Appointment date is required"),
  startTime: Yup.string().required("Start time is required"),
  title: Yup.string().required("Title is required"),
  mode: Yup.string().required("Mode is required"),
  meetingLink: Yup.string().when("mode", {
    is: "online",
    then: (schema) =>
      schema.required("Meeting link is required for online appointments"),
    otherwise: (schema) => schema.notRequired(),
  }),
  location: Yup.string(),
  status: Yup.string()
    .oneOf(
      [
        "scheduled",
        "in-progress",
        "completed",
        "cancelled",
        "rescheduled",
        "no-show",
      ],
      "Invalid status"
    )
    .required("Status is required"),
  followUp: Yup.object().shape({
    isFollowUp: Yup.boolean(),
    referenceAppointmentId: Yup.string().when("isFollowUp", {
      is: true,
      then: (schema) => schema.required("Reference appointment is required"),
    }),
  }),
  doctorNote: Yup.string().notRequired(),
});

const toLocalDate = (utcString: string) => {
  if (!utcString) return "";
  const date = new Date(utcString);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

const toLocalTime = (utcString: string) => {
  if (!utcString) return "";
  const date = new Date(utcString);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[1].slice(0, 5);
};

const toUtcISOString = (date: string, time: string) => {
  if (!date || !time) return null;
  const localDateTime = new Date(`${date}T${time}`);
  return new Date(
    localDateTime.getTime() + localDateTime.getTimezoneOffset() * 60000
  ).toISOString();
};

const SectionCard = ({ title, children }: { title: string; children: any }) => (
  <Card
    variant="outline"
    borderRadius="2xl"
    shadow="md"
    p={1}
    // _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
    // transition="all 0.2s ease"
  >
    <CardHeader pb={2}>
      <Text fontSize="xl" fontWeight="semibold" color="blue.600">
        {title}
      </Text>
    </CardHeader>
    <Divider mb={4} />
    <CardBody>{children}</CardBody>
  </Card>
);

const AddAppointmentForm = observer(({ selectedDateAndTime }: any) => {
  const {
    DoctorAppointment: { createDoctorAppointment },
    auth: { openNotification },
  } = stores;

  const parsedDateAndTime = useMemo(() => {
    if (!selectedDateAndTime?.start) return {};
    const { start, end } = selectedDateAndTime;
    return {
      appointmentDate: toLocalDate(start),
      startTime: toLocalTime(start),
      endTime: toLocalTime(end),
    };
  }, [selectedDateAndTime]);

  const onSubmit = (data: any, setSubmitting: any) => {
    const startUTC = toUtcISOString(data.appointmentDate, data.startTime);
    const endUTC = toUtcISOString(data.appointmentDate, data.endTime);

    const formattedData = {
      ...data,
      startTimeUTC: startUTC,
      endTimeUTC: endUTC,
      created_At: new Date().toISOString(),
      updated_At: new Date().toISOString(),
      doctorNote: data.doctorNote,
    };

    createDoctorAppointment(replaceLabelValueObjects(formattedData))
      .then(() => {
        openNotification({
          type: "success",
          title: "CREATED SUCCESSFULLY",
          message: "Appointment has been Created Successfully",
        });
      })
      .catch((err) => {
        openNotification({
          type: "error",
          title: "Failed to Create Appointment",
          message: err?.message,
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Formik
      initialValues={{
        primaryDoctor: "",
        additionalDoctors: [],
        patient: "",
        appointmentDate: parsedDateAndTime.appointmentDate || "",
        startTime: parsedDateAndTime.startTime || "",
        endTime: parsedDateAndTime.endTime || "",
        title: "",
        description: "",
        mode: "offline",
        meetingLink: "",
        location: "",
        status: "scheduled",
        followUp: {
          isFollowUp: false,
          referenceAppointmentId: "",
        },
        doctorNote: "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => onSubmit(values, setSubmitting)}
      enableReinitialize
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }: any) => (
        <Form>
          <VStack spacing={2} align="stretch">
            {/* === Patient & Doctors === */}
            <SectionCard title="Patient & Doctors">
              <Grid gap={4} gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}>
                <CustomInput
                  name="patient"
                  placeholder="Search Patient"
                  type="real-time-user-search"
                  label="Patient"
                  required
                  value={values.patient}
                  onChange={(val: any) => setFieldValue("patient", val)}
                  options={values?.patient ? [values?.patient] : []}
                  error={errors.patient as string}
                  showError={touched.patient}
                  query={{ type: "patient" }}
                />
                <CustomInput
                  name="primaryDoctor"
                  placeholder="Search Doctor"
                  type="real-time-user-search"
                  label="Primary Doctor"
                  required
                  value={values.primaryDoctor}
                  onChange={(val: any) => setFieldValue("primaryDoctor", val)}
                  options={values?.primaryDoctor ? [values?.primaryDoctor] : []}
                  error={errors.primaryDoctor as string}
                  showError={touched.primaryDoctor}
                  query={{ type: "doctor" }}
                />
              </Grid>
              <Box mt={4}>
                <CustomInput
                  name="additionalDoctors"
                  placeholder="Select Additional Doctors"
                  type="real-time-user-search"
                  label="Additional Doctors"
                  isMulti
                  value={values.additionalDoctors}
                  onChange={(val: any) =>
                    setFieldValue("additionalDoctors", val)
                  }
                  query={{ type: "doctor" }}
                />
              </Box>
            </SectionCard>

            {/* === Appointment Details === */}
            <SectionCard title="Appointment Details">
              <VStack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                  <CustomInput
                    name="appointmentDate"
                    label="Date"
                    type="date"
                    required
                    value={values.appointmentDate}
                    onChange={(e: any) =>
                      setFieldValue("appointmentDate", e.target.value)
                    }
                    error={errors.appointmentDate as string}
                    showError={touched.appointmentDate}
                  />
                  <CustomInput
                    name="startTime"
                    label="Start Time"
                    type="timeOnly"
                    required
                    value={values.startTime}
                    onChange={(e: any) =>
                      setFieldValue("startTime", e.target.value)
                    }
                    error={errors.startTime as string}
                    showError={touched.startTime}
                  />
                  <CustomInput
                    name="endTime"
                    label="End Time"
                    type="timeOnly"
                    value={values.endTime}
                    onChange={(e: any) =>
                      setFieldValue("endTime", e.target.value)
                    }
                  />
                </SimpleGrid>

                <CustomInput
                  name="title"
                  label="Title"
                  type="text"
                  placeholder="Enter appointment title"
                  required
                  value={values.title}
                  onChange={(e: any) => setFieldValue("title", e.target.value)}
                  error={errors.title as string}
                  showError={touched.title}
                />

                <CustomInput
                  name="description"
                  label="Description"
                  type="textarea"
                  placeholder="Enter appointment description"
                  value={values.description}
                  onChange={(e: any) =>
                    setFieldValue("description", e.target.value)
                  }
                />
              </VStack>
            </SectionCard>

            {/* === Mode & Location === */}
            <SectionCard title="Mode & Location">
              <VStack spacing={4}>
                <CustomInput
                  name="mode"
                  label="Appointment Mode"
                  type="select"
                  options={[
                    { label: "Offline", value: "offline" },
                    { label: "Online", value: "online" },
                  ]}
                  value={{
                    label:
                      values.mode.charAt(0).toUpperCase() +
                      values.mode.slice(1),
                    value: values.mode,
                  }}
                  onChange={(opt: any) => setFieldValue("mode", opt?.value)}
                />

                {values.mode === "online" ? (
                  <CustomInput
                    name="meetingLink"
                    label="Meeting Link"
                    type="url"
                    required
                    placeholder="https://meet.google.com/..."
                    value={values.meetingLink}
                    onChange={(e: any) =>
                      setFieldValue("meetingLink", e.target.value)
                    }
                    error={errors.meetingLink as string}
                    showError={touched.meetingLink}
                  />
                ) : (
                  <CustomInput
                    name="location"
                    label="Location"
                    type="text"
                    required
                    placeholder="Clinic Room 203, XYZ Hospital"
                    value={values.location}
                    onChange={(e: any) =>
                      setFieldValue("location", e.target.value)
                    }
                    error={errors.location as string}
                    showError={touched.location}
                  />
                )}
              </VStack>
            </SectionCard>

            {/* === Status & Follow-up === */}
            <SectionCard title="Status & Follow-up">
              <VStack spacing={4}>
                <CustomInput
                  name="status"
                  label="Appointment Status"
                  type="select"
                  isPortal
                  required
                  options={appointStatus}
                  value={{
                    label:
                      values.status.charAt(0).toUpperCase() +
                      values.status.slice(1).replace("-", " "),
                    value: values.status,
                  }}
                  onChange={(opt: any) => setFieldValue("status", opt?.value)}
                  error={errors.status as string}
                  showError={touched.status}
                />

                <FormControl>
                  <HStack align="center">
                    <FormLabel mb="0" fontWeight="medium">
                      Is this a follow-up appointment?
                    </FormLabel>
                    <Switch
                      isChecked={values.followUp.isFollowUp}
                      onChange={(e) =>
                        setFieldValue("followUp.isFollowUp", e.target.checked)
                      }
                    />
                  </HStack>
                </FormControl>

                {values.followUp.isFollowUp && (
                  <CustomInput
                    name="followUp.referenceAppointmentId"
                    label="Reference Appointment"
                    placeholder="Search previous appointment"
                    type="text"
                    value={values.followUp.referenceAppointmentId}
                    onChange={(val: any) =>
                      setFieldValue(
                        "followUp.referenceAppointmentId",
                        val?._id || val
                      )
                    }
                    error={errors.followUp?.referenceAppointmentId as string}
                    showError={touched.followUp?.referenceAppointmentId}
                  />
                )}
              </VStack>
            </SectionCard>

            {/* === Doctor Notes === */}
            <SectionCard title="Additional Notes">
              <CustomInput
                name="doctorNote"
                label="Doctor Notes (optional)"
                type="textarea"
                placeholder="Any consultation notes, patient history, or setup instructions..."
                value={values.doctorNote}
                onChange={(e: any) =>
                  setFieldValue("doctorNote", e.target.value)
                }
              />
            </SectionCard>

            {/* === Submit === */}
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              size="lg"
              width="full"
              mt={2}
              borderRadius="xl"
              shadow="md"
            >
              Save Appointment
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
});

export default AddAppointmentForm;
