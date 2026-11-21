import React from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Text,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

interface Staff {
  name: string;
  email: string;
  phone: string;
}

interface StaffInputProps {
  values: { staffs: Staff[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const StaffInput = ({ values, setFieldValue, errors }: StaffInputProps) => {
  return (
    <FieldArray name="staffs">
      {({ remove, push }) => (
        <Box
          bg={useColorModeValue("white", "darkBrand.100")}
          borderWidth="1px"
          borderColor={useColorModeValue("gray.200", "darkBrand.200")}
          p={4}
          borderRadius="xl"
          boxShadow="md"
        >
          <Text fontWeight="bold" fontSize="lg" mb={4} color={useColorModeValue("gray.800", "white")}>
            Staff Members
          </Text>

          <Grid templateColumns={{ base: "1fr", md: "1fr" }} gap={6}>
            {values.staffs.map((staffs, index) => (
              <Box
                key={index}
                borderWidth="1px"
                borderColor={useColorModeValue("gray.200", "darkBrand.200")}
                bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                borderRadius="xl"
                p={3}
                position="relative"
              >
                <Flex gap={4} mb={3} flexDirection={{ base: "column", md: "row" }}>
                  <CustomInput
                    name={`staffs[${index}].name`}
                    placeholder="Staff Name"
                    type="text"
                    value={staffs.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFieldValue(`staffs[${index}].name`, e.target.value)
                    }
                    error={errors?.staffs?.[index]?.name}
                    showError={errors?.staffs?.[index]?.name}
                  />

                  <CustomInput
                    name={`staffs[${index}].email`}
                    placeholder="Email"
                    // type="email"
                    value={staffs.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFieldValue(`staffs[${index}].email`, e.target.value)
                    }
                    error={errors?.staffs?.[index]?.email}
                    showError={errors?.staffs?.[index]?.email}
                  />

                  <CustomInput
                    name={`staffs[${index}].phone`}
                    placeholder="Phone"
                    // type="tel"
                    value={staffs.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFieldValue(`staffs[${index}].phone`, e.target.value)
                    }
                    error={errors?.staffs?.[index]?.phone}
                    showError={errors?.staffs?.[index]?.phone}
                  />
                </Flex>

                <IconButton
                  aria-label="Remove staff"
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  size="sm"
                  mt={2}
                  onClick={() => remove(index)}
                  float="right"
                  isDisabled={values.staffs.length === 1} // prevent removing last staffs
                />
              </Box>
            ))}
          </Grid>

          <Button
            leftIcon={<AddIcon />}
            mt={4}
            colorScheme="teal"
            onClick={() =>
              push({ name: "", email: "", phone: "" })
            }
          >
            Add Staff
          </Button>
        </Box>
      )}
    </FieldArray>
  );
};

export default StaffInput;
