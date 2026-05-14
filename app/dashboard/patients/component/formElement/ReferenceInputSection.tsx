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

interface Reference {
  refrenceBy: any;
  refrenceNote: string;
}

interface ReferenceInputProps {
  values: { references: Reference[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const ReferenceInputSection = ({
  values,
  setFieldValue,
  errors,
}: ReferenceInputProps) => {
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("gray.200", "darkBrand.200");
  const textColor = useColorModeValue("black", "white");

  return (
    <FieldArray name="references">
      {({ remove, push }) => (
        <Box borderTopWidth={1} pt={4} mt={4} borderColor={borderColor}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="bold" fontSize="lg" color={textColor}>
              References
            </Text>
            <Button
              leftIcon={<AddIcon />}
              size="sm"
              colorScheme="brand"
              onClick={() => push({ refrenceBy: null, refrenceNote: "" })}
            >
              Add Reference
            </Button>
          </Flex>

          <Grid
            templateColumns="1fr"
            gap={4}
          >
            {values.references.map((reference, index) => (
              <Box
                key={index}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                position="relative"
                borderColor={borderColor}
                bg={bgBox}
              >
                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                  gap={4}
                  alignItems="end"
                >
                  <CustomInput
                    name={`references[${index}].refrenceBy`}
                    placeholder="Search Reference (Patient, Doctor, Staff)"
                    type="real-time-user-search"
                    label="Reference By"
                    value={reference.refrenceBy}
                    options={
                      reference?.refrenceBy
                        ? [reference?.refrenceBy || {}]
                        : []
                    }
                    onChange={(e: any) =>
                      setFieldValue(`references[${index}].refrenceBy`, e)
                    }
                    error={errors?.references?.[index]?.refrenceBy}
                    showError={errors?.references?.[index]?.refrenceBy}
                  />
                  
                  <CustomInput
                    name={`references[${index}].refrenceNote`}
                    placeholder="e.g. Brother, Friend, Staff"
                    label="Relation / Note"
                    value={reference.refrenceNote}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFieldValue(`references[${index}].refrenceNote`, e.target.value)
                    }
                    error={errors?.references?.[index]?.refrenceNote}
                    showError={errors?.references?.[index]?.refrenceNote}
                  />
                </Grid>

                {values.references.length > 1 && (
                  <IconButton
                    aria-label="Remove reference"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    size="sm"
                    position="absolute"
                    top={2}
                    right={2}
                    variant="ghost"
                    onClick={() => remove(index)}
                  />
                )}
              </Box>
            ))}
          </Grid>
        </Box>
      )}
    </FieldArray>
  );
};

export default ReferenceInputSection;
