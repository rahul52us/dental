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
          <FormControl id="allergies">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.allergies?.checked ||
                values.medicalHistory?.allergies?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.allergies?.checked ||
                values.medicalHistory?.allergies?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Checkbox
                colorScheme="teal"
                isChecked={values.medicalHistory?.allergies?.checked || false}
                onChange={(e) => {
                  setFieldValue("medicalHistory.allergies.checked", e.target.checked);
                }}
              >
                allergies?
              </Checkbox>
              {values.medicalHistory?.allergies?.checked && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter allergy details"
                  value={values.medicalHistory?.allergies?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.allergies.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Blood Pressure */}
        <GridItem>
          <FormControl id="bloodPressure">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.bloodPressure?.option ||
                values.medicalHistory?.bloodPressure?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.bloodPressure?.option ||
                values.medicalHistory?.bloodPressure?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                blood pressure issues?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.bloodPressure?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.bloodPressure.option", val);
                }}
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
                placeholder="Details (e.g., medication)"
                value={values.medicalHistory?.bloodPressure?.text || ""}
                onChange={(e) => {
                  setFieldValue("medicalHistory.bloodPressure.text", e.target.value);
                }}
              />
            </Box>
          </FormControl>
        </GridItem>

        {/* Heart Disease */}
        <GridItem>
          <FormControl id="heartDisease">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.heartDisease?.checked ||
                values.medicalHistory?.heartDisease?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.heartDisease?.checked ||
                values.medicalHistory?.heartDisease?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Checkbox
                colorScheme="teal"
                isChecked={values.medicalHistory?.heartDisease?.checked || false}
                onChange={(e) => {
                  setFieldValue("medicalHistory.heartDisease.checked", e.target.checked);
                }}
              >
                heart disease?
              </Checkbox>
              {values.medicalHistory?.heartDisease?.checked && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.heartDisease?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.heartDisease.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Pacemaker */}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        <GridItem>
          <FormControl id="pacemaker">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.pacemaker?.checked ||
                values.medicalHistory?.pacemaker?.text ||
                Object.values(values.medicalHistory?.pacemakerMeds || {}).some(
                  (val) => val
                )
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.pacemaker?.checked ||
                values.medicalHistory?.pacemaker?.text ||
                Object.values(values.medicalHistory?.pacemakerMeds || {}).some(
                  (val) => val
                )
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Checkbox
                colorScheme="teal"
                isChecked={values.medicalHistory?.pacemaker?.checked || false}
                onChange={(e) => {
                  setFieldValue("medicalHistory.pacemaker.checked", e.target.checked);
                }}
                mb={3}
                fontSize="md"
                fontWeight="medium"
              >
                Pacemaker
              </Checkbox>
            </Box>
          </FormControl>
          {(values.medicalHistory?.pacemaker?.checked ||
            Object.values(values.medicalHistory?.pacemakerMeds || {}).some(
              (val) => val
            )) && (
            <Box
              mt={2}
              ml={{ base: 4, md: 6 }}
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg="teal.100"
              borderColor="teal.200"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                size="sm"
                mb={4}
                placeholder="Enter pacemaker details (e.g., type, date implanted)"
                value={values.medicalHistory?.pacemaker?.text || ""}
                onChange={(e) => {
                  setFieldValue("medicalHistory.pacemaker.text", e.target.value);
                }}
                bg="white"
                borderColor="teal.300"
              />
              <Text fontSize="sm" fontWeight="medium" mb={3} color="gray.700">
                Taking any of the following?
              </Text>
              <Stack spacing={3}>
                {[
                  { key: "aspirin", label: "Aspirin" },
                  { key: "anticoagulants", label: "Anticoagulants (blood thinners)" },
                  { key: "bloodPressureMeds", label: "High blood pressure medicine" },
                  { key: "nitroglycerin", label: "Nitroglycerin" },
                ].map((med) => (
                  <Checkbox
                    key={med.key}
                    colorScheme="teal"
                    isChecked={values.medicalHistory?.pacemakerMeds?.[med.key] || false}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      setFieldValue(
                        `medicalHistory.pacemakerMeds.${med.key}`,
                        e.target.checked
                      );
                      if (e.target.checked && !values.medicalHistory?.pacemaker?.checked) {
                        setFieldValue("medicalHistory.pacemaker.checked", true);
                      }
                    }}
                    fontSize="sm"
                  >
                    {med.label}
                  </Checkbox>
                ))}
              </Stack>
            </Box>
          )}
        </GridItem>

        <GridItem>
          <FormControl id="diabetes">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.diabetes?.checked ||
                values.medicalHistory?.diabetes?.insulin ||
                values.medicalHistory?.diabetes?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.diabetes?.checked ||
                values.medicalHistory?.diabetes?.insulin ||
                values.medicalHistory?.diabetes?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Checkbox
                colorScheme="teal"
                isChecked={values.medicalHistory?.diabetes?.checked || false}
                onChange={(e) => {
                  setFieldValue("medicalHistory.diabetes.checked", e.target.checked);
                }}
                mb={3}
                fontSize="md"
                fontWeight="medium"
              >
                Diabetes
              </Checkbox>
            </Box>
          </FormControl>
          {(values.medicalHistory?.diabetes?.checked ||
            values.medicalHistory?.diabetes?.insulin) && (
            <Box
              mt={2}
              ml={{ base: 4, md: 6 }}
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg="teal.100"
              borderColor="teal.200"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                size="sm"
                mb={4}
                placeholder="Enter diabetes details (e.g., type, diagnosis date)"
                value={values.medicalHistory?.diabetes?.text || ""}
                onChange={(e) => {
                  setFieldValue("medicalHistory.diabetes.text", e.target.value);
                }}
                bg="white"
                borderColor="teal.300"
              />
              <Checkbox
                colorScheme="teal"
                isChecked={values.medicalHistory?.diabetes?.insulin || false}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  setFieldValue("medicalHistory.diabetes.insulin", e.target.checked);
                  if (e.target.checked && !values.medicalHistory?.diabetes?.checked) {
                    setFieldValue("medicalHistory.diabetes.checked", true);
                  }
                }}
                fontSize="sm"
              >
                Taking insulin or other diabetes drug?
              </Checkbox>
            </Box>
          )}
        </GridItem>
      </Grid>

        {/* Asthma */}
        <GridItem>
          <FormControl id="asthma">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.asthma?.option || values.medicalHistory?.asthma?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.asthma?.option || values.medicalHistory?.asthma?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                asthma?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.asthma?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.asthma.option", val);
                }}
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
                  onChange={(e) => {
                    setFieldValue("medicalHistory.asthma.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Artificial Joint or Valve */}
        <GridItem>
          <FormControl id="artificialJointOrValve">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.artificialJointOrValve?.option ||
                values.medicalHistory?.artificialJointOrValve?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.artificialJointOrValve?.option ||
                values.medicalHistory?.artificialJointOrValve?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                an artificial joint or valve?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.artificialJointOrValve?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.artificialJointOrValve.option", val);
                }}
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
              {values.medicalHistory?.artificialJointOrValve?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.artificialJointOrValve?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.artificialJointOrValve.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Kidney Disease */}
        <GridItem>
          <FormControl id="kidneyDisease">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.kidneyDisease?.option ||
                values.medicalHistory?.kidneyDisease?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.kidneyDisease?.option ||
                values.medicalHistory?.kidneyDisease?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                kidney disease?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.kidneyDisease?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.kidneyDisease.option", val);
                }}
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
              {values.medicalHistory?.kidneyDisease?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.kidneyDisease?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.kidneyDisease.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Tuberculosis or Other Lung Problems */}
        <GridItem>
          <FormControl id="tuberculosis">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.tuberculosis?.option ||
                values.medicalHistory?.tuberculosis?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.tuberculosis?.option ||
                values.medicalHistory?.tuberculosis?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                tuberculosis or other lung problems?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.tuberculosis?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.tuberculosis.option", val);
                }}
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
              {values.medicalHistory?.tuberculosis?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.tuberculosis?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.tuberculosis.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Hepatitis or Other Liver Disease */}
        <GridItem>
          <FormControl id="hepatitis">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.hepatitis?.option ||
                values.medicalHistory?.hepatitis?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.hepatitis?.option ||
                values.medicalHistory?.hepatitis?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                hepatitis or other liver disease?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.hepatitis?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.hepatitis.option", val);
                }}
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
              {values.medicalHistory?.hepatitis?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.hepatitis?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.hepatitis.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Blood Transfusion */}
        <GridItem>
          <FormControl id="bloodTransfusion">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.bloodTransfusion?.option ||
                values.medicalHistory?.bloodTransfusion?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.bloodTransfusion?.option ||
                values.medicalHistory?.bloodTransfusion?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                blood transfusion?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.bloodTransfusion?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.bloodTransfusion.option", val);
                }}
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
              {values.medicalHistory?.bloodTransfusion?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.bloodTransfusion?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.bloodTransfusion.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Cancer or Tumour */}
        <GridItem>
          <FormControl id="cancer">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.cancer?.option ||
                values.medicalHistory?.cancer?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.cancer?.option ||
                values.medicalHistory?.cancer?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                cancer or a tumour?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.cancer?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.cancer.option", val);
                }}
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
              {values.medicalHistory?.cancer?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.cancer?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.cancer.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Neurologic Condition */}
        <GridItem>
          <FormControl id="neurologicCondition">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.neurologicCondition?.option ||
                values.medicalHistory?.neurologicCondition?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.neurologicCondition?.option ||
                values.medicalHistory?.neurologicCondition?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                neurologic condition?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.neurologicCondition?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.neurologicCondition.option", val);
                }}
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
              {values.medicalHistory?.neurologicCondition?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.neurologicCondition?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.neurologicCondition.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Epilepsy, Seizures, or Fainting Spells */}
        <GridItem>
          <FormControl id="epilepsy">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.epilepsy?.option ||
                values.medicalHistory?.epilepsy?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.epilepsy?.option ||
                values.medicalHistory?.epilepsy?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                epilepsy, seizures, or fainting spells?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.epilepsy?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.epilepsy.option", val);
                }}
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
              {values.medicalHistory?.epilepsy?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.epilepsy?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.epilepsy.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* AIDS Positive */}
        <GridItem>
          <FormControl id="aids">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.aids?.option ||
                values.medicalHistory?.aids?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.aids?.option ||
                values.medicalHistory?.aids?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                AIDS positive?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.aids?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.aids.option", val);
                }}
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
              {values.medicalHistory?.aids?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.aids?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.aids.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* HIV Positive */}
        <GridItem>
          <FormControl id="hiv">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.hiv?.option ||
                values.medicalHistory?.hiv?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.hiv?.option ||
                values.medicalHistory?.hiv?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                HIV positive?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.hiv?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.hiv.option", val);
                }}
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
              {values.medicalHistory?.hiv?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.hiv?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.hiv.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Anaemia or Blood Disorders */}
        <GridItem>
          <FormControl id="anaemia">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.anaemia?.option ||
                values.medicalHistory?.anaemia?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.anaemia?.option ||
                values.medicalHistory?.anaemia?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                anaemia or blood disorders?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.anaemia?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.anaemia.option", val);
                }}
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
              {values.medicalHistory?.anaemia?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.anaemia?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.anaemia.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Any Other Medical Issue */}
        <GridItem>
          <FormControl id="otherMedicalIssue">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.otherMedicalIssue?.option === "yes" ||
                values.medicalHistory?.otherMedicalIssue?.text ||
                Object.values(values.medicalHistory?.medications || {}).some(
                  (val) => val === true || (typeof val === "string" && val)
                )
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.otherMedicalIssue?.option === "yes" ||
                values.medicalHistory?.otherMedicalIssue?.text ||
                Object.values(values.medicalHistory?.medications || {}).some(
                  (val) => val === true || (typeof val === "string" && val)
                )
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                any other medical issue?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.otherMedicalIssue?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.otherMedicalIssue.option", val);
                }}
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
              {values.medicalHistory?.otherMedicalIssue?.option === "yes" && (
                <Box mt={3}>
                  <Input
                    size="sm"
                    mb={4}
                    placeholder="Enter details"
                    value={values.medicalHistory?.otherMedicalIssue?.text || ""}
                    onChange={(e) => {
                      setFieldValue("medicalHistory.otherMedicalIssue.text", e.target.value);
                    }}
                  />
                  <Text fontWeight="medium" mb={3} color="gray.700">
                    taking any of the following?
                  </Text>
                  <Stack spacing={3}>
                    {[
                      { key: "antibiotics", label: "Antibiotics" },
                      { key: "antidepressants", label: "Antidepressants / Tranquilizers" },
                      { key: "steroids", label: "Cortisone / Steroids" },
                      { key: "osteoporosisMeds", label: "Osteoporosis medicine" },
                    ].map((med) => (
                      <Checkbox
                        key={med.key}
                        colorScheme="teal"
                        isChecked={values.medicalHistory?.medications?.[med.key] || false}
                        onChange={(e) => {
                          setFieldValue(`medicalHistory.medications.${med.key}`, e.target.checked);
                        }}
                      >
                        {med.label}
                      </Checkbox>
                    ))}
                    <Input
                      size="sm"
                      placeholder="Other medications (first)"
                      value={values.medicalHistory?.medications?.other1 || ""}
                      onChange={(e) => {
                        setFieldValue("medicalHistory.medications.other1", e.target.value);
                      }}
                    />
                    <Input
                      size="sm"
                      placeholder="Other medications (second)"
                      value={values.medicalHistory?.medications?.other2 || ""}
                      onChange={(e) => {
                        setFieldValue("medicalHistory.medications.other2", e.target.value);
                      }}
                    />
                  </Stack>
                </Box>
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
          <FormControl id="smoking">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.smoking?.option ||
                values.medicalHistory?.smoking?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.smoking?.option ||
                values.medicalHistory?.smoking?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                smoke? (Habitual)
              </Text>
              <RadioGroup
                value={values.medicalHistory?.smoking?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.smoking.option", val);
                }}
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
                  placeholder="Details (e.g., daily use)"
                  value={values.medicalHistory?.smoking?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.smoking.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Chewing Tobacco */}
        <GridItem>
          <FormControl id="chewingTobacco">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.chewingTobacco?.option ||
                values.medicalHistory?.chewingTobacco?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.chewingTobacco?.option ||
                values.medicalHistory?.chewingTobacco?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                chew tobacco? (Habitual)
              </Text>
              <RadioGroup
                value={values.medicalHistory?.chewingTobacco?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.chewingTobacco.option", val);
                }}
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
              {values.medicalHistory?.chewingTobacco?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Details (e.g., frequency)"
                  value={values.medicalHistory?.chewingTobacco?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.chewingTobacco.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Alcohol */}
        <GridItem>
          <FormControl id="alcohol">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.alcohol?.option ||
                values.medicalHistory?.alcohol?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.alcohol?.option ||
                values.medicalHistory?.alcohol?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                consume alcohol?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.alcohol?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.alcohol.option", val);
                }}
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
                onChange={(e) => {
                  setFieldValue("medicalHistory.alcohol.text", e.target.value);
                }}
              />
            </Box>
          </FormControl>
        </GridItem>
      </Grid>

      {/* Divider */}
      <Divider my={8} />

      {/* Women-specific */}
      <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
        Women
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        <GridItem>
          <FormControl id="pregnant">
            <Checkbox
              colorScheme="teal"
              isChecked={values.medicalHistory?.women?.pregnant || false}
              onChange={(e) => {
                setFieldValue("medicalHistory.women.pregnant", e.target.checked);
              }}
            >
              pregnancy?
            </Checkbox>
            {values.medicalHistory?.women?.pregnant && (
              <Input
                size="sm"
                mt={3}
                placeholder="Expected delivery date"
                value={values.medicalHistory?.women?.dueDate || ""}
                onChange={(e) => {
                  setFieldValue("medicalHistory.women.dueDate", e.target.value);
                }}
              />
            )}
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="hormones">
            <Checkbox
              colorScheme="teal"
              isChecked={values.medicalHistory?.women?.hormones || false}
              onChange={(e) => {
                setFieldValue("medicalHistory.women.hormones", e.target.checked);
              }}
            >
              taking hormones?
            </Checkbox>
          </FormControl>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default MedicalHistorySection;