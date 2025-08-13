import React from "react";
import {
  Box,
  Button,
  VStack,
  Radio,
  RadioGroup,
  IconButton,
  Text,
  Flex,
  Badge,
  GridItem,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

interface BankAccount {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch?: string;
  primary: boolean;
}

interface BankDetailsInputProps {
  values: { bankAccounts: BankAccount[] };
  setFieldValue: (field: string, value: any) => void;
  errors?: any;
  touched?: any;
}

const BankDetailsInput = ({
  values,
  setFieldValue,
  errors,
  touched,
}: BankDetailsInputProps) => {
  const primaryIndex = values.bankAccounts.findIndex((b) => b.primary);

  const handlePrimaryChange = (val: string) => {
    const idx = parseInt(val, 10);
    const updatedBanks = values.bankAccounts.map((b, i) => ({
      ...b,
      primary: i === idx,
    }));
    setFieldValue("bankAccounts", updatedBanks);
  };

  const canRemove = (index: number) => {
    if (values.bankAccounts.length === 1) return false;
    if (index === primaryIndex) return false;
    return true;
  };

  return (
    <GridItem colSpan={3}>
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        boxShadow="sm"
        bg="white"
        mt={3}
      >
        <FieldArray name="bankAccounts">
          {({ remove, push }) => (
            <Box bg="white" p={4} borderRadius="md" boxShadow="md" mt={6}>
              <Text fontWeight="bold" fontSize="lg" mb={4}>
                Bank Details
              </Text>

              <RadioGroup
                value={primaryIndex.toString()}
                onChange={handlePrimaryChange}
              >
                <VStack spacing={6} align="stretch">
                  {values.bankAccounts.map((bank, index) => (
                    <Box
                      key={index}
                      borderWidth="1px"
                      borderRadius="md"
                      p={4}
                    //   bg={bank.primary ? "teal.50" : "white"}
                      position="relative"
                    >
                      <Flex align="center" mb={3}>
                        <Radio
                          value={index.toString()}
                          aria-label={`Select primary bank account ${
                            bank.accountNumber || index + 1
                          }`}
                          mr={3}
                        />
                        <Text fontWeight="semibold" flexGrow={1} noOfLines={1}>
                          {bank.bankName || "Bank Name"}
                        </Text>
                        {bank.primary && (
                          <Badge
                            colorScheme="teal"
                            fontSize="0.75rem"
                            py={1}
                            px={2}
                          >
                            Primary
                          </Badge>
                        )}
                        <IconButton
                          aria-label="Remove bank account"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          ml={3}
                          onClick={() => remove(index)}
                          isDisabled={!canRemove(index)}
                          title={
                            !canRemove(index)
                              ? "Cannot remove primary bank account. Select another primary first."
                              : undefined
                          }
                        />
                      </Flex>

                      {/* Fields stacked vertically */}
                      <VStack spacing={3} align="stretch">
                        <CustomInput
                          name={`bankAccounts[${index}].accountHolder`}
                          placeholder="Account Holder"
                          label="Account Holder"
                          required
                          value={bank.accountHolder}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              `bankAccounts[${index}].accountHolder`,
                              e.target.value
                            )
                          }
                          error={
                            errors?.bankAccounts?.[index]?.accountHolder
                          }
                          showError={
                            errors?.bankAccounts?.[index]?.accountHolder
                          }
                        />

                        <CustomInput
                          name={`bankAccounts[${index}].bankName`}
                          placeholder="Bank Name"
                          label="Bank Name"
                          required
                          value={bank.bankName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              `bankAccounts[${index}].bankName`,
                              e.target.value
                            )
                          }
                          error={
                            errors?.bankAccounts?.[index]?.bankName
                          }
                          showError={
                            errors?.bankAccounts?.[index]?.bankName
                          }
                        />

                        <CustomInput
                          name={`bankAccounts[${index}].accountNumber`}
                          placeholder="Account Number"
                          label="Account Number"
                          required
                          value={bank.accountNumber}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              `bankAccounts[${index}].accountNumber`,
                              e.target.value
                            )
                          }
                          error={
                            errors?.bankAccounts?.[index]?.accountNumber
                          }
                          showError={
                            errors?.bankAccounts?.[index]?.accountNumber
                          }
                        />

                        <CustomInput
                          name={`bankAccounts[${index}].ifscCode`}
                          placeholder="IFSC Code"
                          label="IFSC Code"
                          required
                          value={bank.ifscCode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              `bankAccounts[${index}].ifscCode`,
                              e.target.value
                            )
                          }
                          error={
                            errors?.bankAccounts?.[index]?.ifscCode
                          }
                          showError={
                            errors?.bankAccounts?.[index]?.ifscCode
                          }
                        />

                        <CustomInput
                          name={`bankAccounts[${index}].branch`}
                          placeholder="Branch"
                          label="Branch"
                          required
                          value={bank.branch}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              `bankAccounts[${index}].branch`,
                              e.target.value
                            )
                          }
                          error={
                            errors?.bankAccounts?.[index]?.branch
                          }
                          showError={
                            errors?.bankAccounts?.[index]?.branch
                          }
                        />
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </RadioGroup>

              <Button
                leftIcon={<AddIcon />}
                mt={4}
                colorScheme="teal"
                onClick={() =>
                  push({
                    accountHolder: "",
                    bankName: "",
                    accountNumber: "",
                    ifscCode: "",
                    branch: "",
                    primary: values.bankAccounts.length === 0,
                  })
                }
              >
                Add Bank Account
              </Button>
            </Box>
          )}
        </FieldArray>
      </Box>
    </GridItem>
  );
};

export default BankDetailsInput;
