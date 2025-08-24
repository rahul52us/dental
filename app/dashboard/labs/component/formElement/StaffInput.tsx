import React from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Text,
  Flex,
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
  values: { staff: Staff[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const StaffInput = ({ values, setFieldValue, errors }: StaffInputProps) => {
  return (
    <FieldArray name="staff">
      {({ remove, push }) => (
        <Box bg="white" p={4} borderRadius="md" boxShadow="md">
          <Text fontWeight="bold" fontSize="lg" mb={4}>
            Staff Members
          </Text>

          <Grid templateColumns={{ base: "1fr", md: "1fr" }} gap={6}>
            {values.staff.map((staff, index) => (
              <Box
                key={index}
                borderWidth="1px"
                borderRadius="md"
                p={3}
                position="relative"
              >
                <Flex gap={4} mb={3} flexDirection={{ base: "column", md: "row" }}>
                  <CustomInput
                    name={`staff[${index}].name`}
                    placeholder="Staff Name"
                    type="text"
                    value={staff.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFieldValue(`staff[${index}].name`, e.target.value)
                    }
                    error={errors?.staff?.[index]?.name}
                    showError={errors?.staff?.[index]?.name}
                  />

                  <CustomInput
                    name={`staff[${index}].email`}
                    placeholder="Email"
                    // type="email"
                    value={staff.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFieldValue(`staff[${index}].email`, e.target.value)
                    }
                    error={errors?.staff?.[index]?.email}
                    showError={errors?.staff?.[index]?.email}
                  />

                  <CustomInput
                    name={`staff[${index}].phone`}
                    placeholder="Phone"
                    // type="tel"
                    value={staff.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFieldValue(`staff[${index}].phone`, e.target.value)
                    }
                    error={errors?.staff?.[index]?.phone}
                    showError={errors?.staff?.[index]?.phone}
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
                  isDisabled={values.staff.length === 1} // prevent removing last staff
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
