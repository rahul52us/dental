import {
  Box,
  Text,
  GridItem,
  Button,
  VStack,
  SimpleGrid,
  IconButton,
  Grid,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon } from "@chakra-ui/icons";
import { FiPlus } from "react-icons/fi";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

const InsuranceDetailsSection = ({
  values,
  handleChange,
  setFieldValue,
  errors,
  touched,
}: any) => {
  return (
    <GridItem colSpan={2}>
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        boxShadow="sm"
        bg="white"
        mt={3}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4} color="teal.600">
          Insurance Details
        </Text>

        <FieldArray name="insurances">
          {({ remove, push }) => (
            <>
              <VStack spacing={6} align="stretch">
                {values.insurances && values.insurances.length > 0 ? (
                  values.insurances.map((insurance, index) => (
                    <Box
                      key={index}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      boxShadow="xs"
                      bg="gray.50"
                    >
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        {/* Insurance Type */}
                        <CustomInput
                          label="Type"
                          name={`insurances[${index}].type`}
                          type="select"
                          options={[
                            { label: "Health", value: "Health" },
                            { label: "Life", value: "Life" },
                            { label: "Vehicle", value: "Vehicle" },
                            { label: "Home", value: "Home" },
                            { label: "Other", value: "Other" },
                          ]}
                          value={insurance.type || ""}
                          onChange={(e: any) =>
                            setFieldValue(
                              `insurances[${index}].type`,
                              e.target ? e.target.value : e
                            )
                          }
                          error={
                            errors?.insurances?.[index]?.type &&
                            touched?.insurances?.[index]?.type
                          }
                          showError={
                            errors?.insurances?.[index]?.type &&
                            touched?.insurances?.[index]?.type
                          }
                        />

                        {/* Start Date */}
                        <CustomInput
                          label="Start Date"
                          type="date"
                          name={`insurances[${index}].startDate`}
                          value={insurance.startDate || ""}
                          onChange={handleChange}
                          error={
                            errors?.insurances?.[index]?.startDate &&
                            touched?.insurances?.[index]?.startDate
                          }
                          showError={
                            errors?.insurances?.[index]?.startDate &&
                            touched?.insurances?.[index]?.startDate
                          }
                        />

                        {/* Renewal Date */}
                        <CustomInput
                          label="Renewal Date"
                          type="date"
                          name={`insurances[${index}].renewalDate`}
                          value={insurance.renewalDate || ""}
                          onChange={handleChange}
                          error={
                            errors?.insurances?.[index]?.renewalDate &&
                            touched?.insurances?.[index]?.renewalDate
                          }
                          showError={
                            errors?.insurances?.[index]?.renewalDate &&
                            touched?.insurances?.[index]?.renewalDate
                          }
                        />

                        {/* Amount Insured */}
                        <CustomInput
                          label="Amount Insured"
                          type="number"
                          name={`insurances[${index}].amountInsured`}
                          value={insurance.amountInsured || ""}
                          onChange={handleChange}
                          placeholder="Enter insured amount"
                          error={
                            errors?.insurances?.[index]?.amountInsured &&
                            touched?.insurances?.[index]?.amountInsured
                          }
                          showError={
                            errors?.insurances?.[index]?.amountInsured &&
                            touched?.insurances?.[index]?.amountInsured
                          }
                        />

                        {/* Amount Paid */}
                        <CustomInput
                          label="Amount Paid"
                          type="number"
                          name={`insurances[${index}].amountPaid`}
                          value={insurance.amountPaid || ""}
                          onChange={handleChange}
                          placeholder="Enter amount paid"
                          error={
                            errors?.insurances?.[index]?.amountPaid &&
                            touched?.insurances?.[index]?.amountPaid
                          }
                          showError={
                            errors?.insurances?.[index]?.amountPaid &&
                            touched?.insurances?.[index]?.amountPaid
                          }
                        />

                        {/* Remarks - full width */}
                        <Grid gridColumn={{ base: "span 1", md: "span 3" }}>
                          <CustomInput
                            label="Remarks"
                            name={`insurances[${index}].remarks`}
                            value={insurance.remarks || ""}
                            onChange={handleChange}
                            type="textarea"
                            placeholder="Any additional notes"
                          />
                        </Grid>

                        {/* Delete Button - full width */}
                        <Grid
                          gridColumn={{ base: "span 1", md: "span 3" }}
                          textAlign="right"
                          display={
                            values?.insurances?.length === 1 ? "none" : undefined
                          }
                        >
                          <IconButton
                            aria-label="Remove Insurance Entry"
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                          />
                        </Grid>
                      </SimpleGrid>
                    </Box>
                  ))
                ) : (
                  <Text>No insurance records added yet.</Text>
                )}
              </VStack>

              {/* Add Insurance Button */}
              <Button
                leftIcon={<FiPlus />}
                colorScheme="teal"
                mt={4}
                onClick={() =>
                  push({
                    type: "",
                    startDate: "",
                    renewalDate: "",
                    amountInsured: "",
                    amountPaid: "",
                    remarks: "",
                  })
                }
              >
                Add Insurance
              </Button>
            </>
          )}
        </FieldArray>
      </Box>
    </GridItem>
  );
};

export default InsuranceDetailsSection;