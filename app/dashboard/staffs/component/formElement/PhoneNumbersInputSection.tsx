import React from "react";
import {
  Box,
  Button,
  Grid,
  Radio,
  RadioGroup,
  IconButton,
  Text,
  Badge,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "react-i18next";

interface Phone {
  number: string;
  primary: boolean;
  countryCode?: string;
}

interface PhoneNumbersInputProps {
  values: { phones: Phone[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const PhoneNumbersInput = ({
  values,
  setFieldValue,
  errors,
}: PhoneNumbersInputProps) => {
  const { t } = useTranslation();
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("gray.200", "darkBrand.200");
  const textColor = useColorModeValue("black", "white");

  const primaryIndex = values.phones.findIndex((p) => p.primary);
  const handlePrimaryChange = (val: string) => {
    const idx = parseInt(val, 10);
    const updatedPhones = values.phones.map((p, i) => ({
      ...p,
      primary: i === idx,
    }));
    setFieldValue("phones", updatedPhones);
  };

  const canRemove = (index: number) => {
    if (values.phones.length === 1) return false;
    if (index === primaryIndex) return false;
    return true;
  };

  return (
    <FieldArray name="phones">
      {({ remove, push }) => (
        <Box bg={bgBox} p={4} borderRadius="md" boxShadow="md">
          <Text fontWeight="bold" fontSize="lg" mb={4} color={textColor}>
            {t("common.form.phoneNumbers")}
          </Text>

          <RadioGroup
            value={primaryIndex.toString()}
            onChange={handlePrimaryChange}
          >
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              {values.phones.map((phone, index) => (
                <Box
                  key={index}
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  position="relative"
                  borderColor={borderColor}
                >
                  <Flex align="center" mb={2}>
                    <Radio
                      value={index.toString()}
                      mr={2}
                      aria-label={`Select primary phone ${phone.number || index + 1}`}
                    />
                    <Text fontWeight="medium" flexGrow={1} noOfLines={1}>
                      <Flex gap={2}>
                        {" "}
                        <Text> {t("common.form.phoneEntered")} </Text>
                        {phone.primary && (
                          <Text as="span" color="red">
                            {" "}
                            *
                          </Text>
                        )}
                      </Flex>
                    </Text>
                    {phone.primary && (
                      <Badge
                        bg="#FED7E2" color="#1A202C"
                        ml={2}
                        fontSize="0.75rem"
                        py={1}
                        px={2}
                      >
                        {t("common.form.primary")}
                      </Badge>
                    )}
                  </Flex>

                  <Box mt={1}>
                    <PhoneInput
                      country={"in"}
                      value={(phone.countryCode?.replace("+", "") || "91") + phone.number}
                      onChange={(value, countryData: any) => {
                        const dialCode = countryData?.dialCode || "91";
                        const localNumber = value.startsWith(dialCode)
                          ? value.slice(dialCode.length)
                          : value;
                        setFieldValue(`phones[${index}].number`, localNumber);
                        setFieldValue(`phones[${index}].countryCode`, `+${dialCode}`);
                      }}
                      inputStyle={{
                        width: "100%",
                        height: "40px",
                        fontSize: "14px",
                        borderRadius: "8px",
                        border: errors?.phones?.[index]?.number || (typeof errors?.phones === "string" && phone.primary)
                          ? "1px solid red"
                          : "1px solid #E2E8F0",
                      }}
                      buttonStyle={{
                        borderRadius: "8px 0 0 8px",
                        border: "1px solid #E2E8F0",
                        background: "transparent",
                      }}
                      containerStyle={{
                        width: "100%",
                      }}
                      enableSearch
                      searchPlaceholder="Search country..."
                    />
                    {errors?.phones?.[index]?.number && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.phones[index].number}
                      </Text>
                    )}
                    {typeof errors?.phones === "string" && phone.primary && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.phones}
                      </Text>
                    )}
                  </Box>

                  <IconButton
                    aria-label="Remove phone"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    size="sm"
                    mt={2}
                    onClick={() => remove(index)}
                    isDisabled={!canRemove(index)}
                    title={
                      !canRemove(index)
                        ? t("common.form.cannotRemovePrimaryPhone")
                        : undefined
                    }
                    float="right"
                  />
                </Box>
              ))}
            </Grid>
          </RadioGroup>

          <Button
            leftIcon={<AddIcon />}
            mt={4}
            colorScheme="brand"
            onClick={() =>
              push({ number: "", primary: values.phones.length === 0, countryCode: "+91" })
            }
          >
            {t("common.form.addPhone")}
          </Button>
        </Box>
      )}
    </FieldArray>
  );
};

export default PhoneNumbersInput;
