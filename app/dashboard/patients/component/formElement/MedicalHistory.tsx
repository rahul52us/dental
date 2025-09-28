"use client";
import {
  Box,
  Checkbox,
  Input,
  Text,
  Grid,
  GridItem,
  FormControl,
  Radio,
  RadioGroup,
  Stack,
  Divider,
} from "@chakra-ui/react";

const MedicalHistorySection = ({ values, setFieldValue }: any) => {
  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      mt={6}
      p={6}
    >
      <Text fontSize="2xl" fontWeight="bold" mb={6} color="teal.600">
        Medical History
      </Text>

      {/* Conditions */}
      <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
        Conditions
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        {/* Allergies */}
        <GridItem>
          <FormControl>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.allergies?.checked ? "teal.50" : "gray.50"
              }
              borderColor={
                values.medicalHistory?.allergies?.checked
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Checkbox
                colorScheme="teal"
                isChecked={values.medicalHistory?.allergies?.checked || false}
                onChange={(e) =>
                  setFieldValue(
                    "medicalHistory.allergies.checked",
                    e.target.checked
                  )
                }
              >
                Allergies
              </Checkbox>
              {values.medicalHistory?.allergies?.checked && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter allergy details"
                  value={values.medicalHistory?.allergies?.text || ""}
                  onChange={(e) =>
                    setFieldValue("medicalHistory.allergies.text", e.target.value)
                  }
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Blood Pressure */}
        <GridItem>
          <FormControl>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.bloodPressure?.option
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.bloodPressure?.option
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                Blood Pressure
              </Text>
              <RadioGroup
                value={values.medicalHistory?.bloodPressure?.option || ""}
                onChange={(val) =>
                  setFieldValue("medicalHistory.bloodPressure.option", val)
                }
              >
                <Stack direction="row">
                  <Radio value="high" colorScheme="teal">
                    High
                  </Radio>
                  <Radio value="low" colorScheme="teal">
                    Low
                  </Radio>
                </Stack>
              </RadioGroup>
              <Input
                size="sm"
                mt={3}
                placeholder="Details (e.g. medication)"
                value={values.medicalHistory?.bloodPressure?.text || ""}
                onChange={(e) =>
                  setFieldValue(
                    "medicalHistory.bloodPressure.text",
                    e.target.value
                  )
                }
              />
            </Box>
          </FormControl>
        </GridItem>

        {/* Heart Disease */}
        <GridItem>
          <FormControl>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.heartDisease?.checked
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.heartDisease?.checked
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Checkbox
                colorScheme="teal"
                isChecked={values.medicalHistory?.heartDisease?.checked || false}
                onChange={(e) =>
                  setFieldValue(
                    "medicalHistory.heartDisease.checked",
                    e.target.checked
                  )
                }
              >
                Heart Disease
              </Checkbox>
              {values.medicalHistory?.heartDisease?.checked && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.heartDisease?.text || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "medicalHistory.heartDisease.text",
                      e.target.value
                    )
                  }
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Pacemaker (Yes / No + text) */}
        <GridItem>
          <FormControl>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.pacemaker?.option
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.pacemaker?.option
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                Pacemaker
              </Text>
              <RadioGroup
                value={values.medicalHistory?.pacemaker?.option || ""}
                onChange={(val) =>
                  setFieldValue("medicalHistory.pacemaker.option", val)
                }
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="teal">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="teal">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.pacemaker?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.pacemaker?.text || ""}
                  onChange={(e) =>
                    setFieldValue("medicalHistory.pacemaker.text", e.target.value)
                  }
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Diabetes */}
        <GridItem>
          <FormControl>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.diabetes?.option ? "teal.50" : "gray.50"
              }
              borderColor={
                values.medicalHistory?.diabetes?.option
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                Diabetes
              </Text>
              <RadioGroup
                value={values.medicalHistory?.diabetes?.option || ""}
                onChange={(val) =>
                  setFieldValue("medicalHistory.diabetes.option", val)
                }
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="teal">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="teal">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.diabetes?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Taking insulin or other drug?"
                  value={values.medicalHistory?.diabetes?.text || ""}
                  onChange={(e) =>
                    setFieldValue("medicalHistory.diabetes.text", e.target.value)
                  }
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Asthma */}
        <GridItem>
          <FormControl>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.asthma?.option ? "teal.50" : "gray.50"
              }
              borderColor={
                values.medicalHistory?.asthma?.option ? "teal.300" : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                Asthma
              </Text>
              <RadioGroup
                value={values.medicalHistory?.asthma?.option || ""}
                onChange={(val) =>
                  setFieldValue("medicalHistory.asthma.option", val)
                }
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="teal">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="teal">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.asthma?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.asthma?.text || ""}
                  onChange={(e) =>
                    setFieldValue("medicalHistory.asthma.text", e.target.value)
                  }
                />
              )}
            </Box>
          </FormControl>
        </GridItem>
      </Grid>

      {/* Divider */}
      <Divider my={8} />

      {/* Habits */}
      <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
        Habits
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        {/* Smoking */}
        <GridItem>
          <FormControl>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.smoking?.option ? "teal.50" : "gray.50"
              }
              borderColor={
                values.medicalHistory?.smoking?.option ? "teal.300" : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                Do you smoke? (Habitual)
              </Text>
              <RadioGroup
                value={values.medicalHistory?.smoking?.option || ""}
                onChange={(val) =>
                  setFieldValue("medicalHistory.smoking.option", val)
                }
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="teal">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="teal">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.smoking?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Details (e.g. daily use)"
                  value={values.medicalHistory?.smoking?.text || ""}
                  onChange={(e) =>
                    setFieldValue("medicalHistory.smoking.text", e.target.value)
                  }
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Alcohol */}
        <GridItem>
          <FormControl>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.alcohol?.option ? "teal.50" : "gray.50"
              }
              borderColor={
                values.medicalHistory?.alcohol?.option ? "teal.300" : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                Alcohol
              </Text>
              <RadioGroup
                value={values.medicalHistory?.alcohol?.option || ""}
                onChange={(val) =>
                  setFieldValue("medicalHistory.alcohol.option", val)
                }
              >
                <Stack direction="row">
                  <Radio value="occasional" colorScheme="teal">
                    Occasional
                  </Radio>
                  <Radio value="habitual" colorScheme="teal">
                    Habitual
                  </Radio>
                </Stack>
              </RadioGroup>
              <Input
                size="sm"
                mt={3}
                placeholder="Additional details"
                value={values.medicalHistory?.alcohol?.text || ""}
                onChange={(e) =>
                  setFieldValue("medicalHistory.alcohol.text", e.target.value)
                }
              />
            </Box>
          </FormControl>
        </GridItem>
      </Grid>

      {/* Divider */}
      <Divider my={8} />

      {/* Medications */}
      <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
        Are you taking any of the following?
      </Text>
      <Stack spacing={3}>
        {[
          { key: "aspirin", label: "Aspirin" },
          { key: "anticoagulants", label: "Anticoagulants (blood thinners)" },
          { key: "bloodPressureMeds", label: "High blood pressure medicine" },
          { key: "nitroglycerin", label: "Nitroglycerin" },
          { key: "antibiotics", label: "Antibiotics" },
          { key: "antidepressants", label: "Antidepressants / Tranquilizers" },
          { key: "steroids", label: "Cortisone / Steroids" },
          { key: "osteoporosisMeds", label: "Osteoporosis medicine" },
        ].map((med) => (
          <Checkbox
            key={med.key}
            colorScheme="teal"
            isChecked={values.medicalHistory?.medications?.[med.key] || false}
            onChange={(e) =>
              setFieldValue(
                `medicalHistory.medications.${med.key}`,
                e.target.checked
              )
            }
          >
            {med.label}
          </Checkbox>
        ))}
        <Input
          size="sm"
          placeholder="Other medications"
          value={values.medicalHistory?.medications?.other || ""}
          onChange={(e) =>
            setFieldValue("medicalHistory.medications.other", e.target.value)
          }
        />
      </Stack>

      {/* Divider */}
      <Divider my={8} />

      {/* Women-specific */}
      <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
        Women
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        <GridItem>
          <FormControl>
            <Checkbox
              colorScheme="teal"
              isChecked={values.medicalHistory?.women?.pregnant || false}
              onChange={(e) =>
                setFieldValue("medicalHistory.women.pregnant", e.target.checked)
              }
            >
              pregnant
            </Checkbox>
            {values.medicalHistory?.women?.pregnant && (
              <Input
                size="sm"
                mt={3}
                placeholder="Expected delivery date"
                value={values.medicalHistory?.women?.dueDate || ""}
                onChange={(e) =>
                  setFieldValue("medicalHistory.women.dueDate", e.target.value)
                }
              />
            )}
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <Checkbox
              colorScheme="teal"
              isChecked={values.medicalHistory?.women?.hormones || false}
              onChange={(e) =>
                setFieldValue("medicalHistory.women.hormones", e.target.checked)
              }
            >
              Taking hormones
            </Checkbox>
          </FormControl>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default MedicalHistorySection;
