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
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { useTranslation } from "react-i18next";

interface Email {
  email: string;
  primary: boolean;
}

interface EmailsInputProps {
  values: { emails: Email[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const EmailsInput = ({
  values,
  setFieldValue,
  errors
}: EmailsInputProps) => {
  const { t } = useTranslation();
  const primaryIndex = values.emails.findIndex((e) => e.primary);

  const handlePrimaryChange = (val: string) => {
    const idx = parseInt(val, 10);
    const updatedEmails = values.emails.map((e, i) => ({
      ...e,
      primary: i === idx,
    }));
    setFieldValue("emails", updatedEmails);
  };

  const canRemove = (index: number) => {
    if (values.emails.length === 1) return false;
    if (index === primaryIndex) return false;
    return true;
  };

  return (
    <FieldArray name="emails">
      {({ remove, push }) => (
        <Box bg="white" p={4} borderRadius="md" boxShadow="md">
          <Text fontWeight="bold" fontSize="lg" mb={4}>
            {t("common.form.emailAddresses")}
          </Text>

          <RadioGroup
            value={primaryIndex.toString()}
            onChange={handlePrimaryChange}
          >
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              {values.emails.map((email, index) => {
                return (
                  <Box
                    key={index}
                    borderWidth="1px"
                    borderRadius="md"
                    p={3}
                    position="relative"
                    //   bg={email.primary ? "teal.50" : "white"}
                  >
                    <Flex align="center" mb={2}>
                      <Radio
                        value={index.toString()}
                        mr={2}
                        aria-label={`Select primary email ${
                          email.email || index + 1
                        }`}
                      />
                      <Text fontWeight="medium" flexGrow={1} noOfLines={1}>
                        <Flex gap={2}> <Text> {t("common.form.emailEntered")} </Text>{email.primary && <Text as="span" color="red">
                                {" "}
                                *
                              </Text>}</Flex>
                      </Text>

                      {email.primary && (
                        <Badge
                          colorScheme="teal"
                          ml={2}
                          fontSize="0.75rem"
                          py={1}
                          px={2}
                        >
                          {t("common.form.primary")}
                        </Badge>
                      )}
                    </Flex>

                    <CustomInput
                      name={`emails[${index}].email`}
                      placeholder={t("common.form.enterEmail")}
                      type="text"
                      value={email.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFieldValue(`emails[${index}].email`, e.target.value)
                      }
                      error={errors?.emails?.[index]?.email}
                      showError={errors?.emails?.[index]?.email}
                    />

                    <IconButton
                      aria-label="Remove email"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      mt={2}
                      onClick={() => remove(index)}
                      isDisabled={!canRemove(index)}
                      title={
                        !canRemove(index)
                          ? t("common.form.cannotRemovePrimaryEmail")
                          : undefined
                      }
                      float="right"
                    />
                  </Box>
                );
              })}
            </Grid>
          </RadioGroup>

          <Button
            leftIcon={<AddIcon />}
            mt={4}
            colorScheme="teal"
            onClick={() =>
              push({ email: "", primary: values.emails.length === 0 })
            }
          >
            {t("common.form.addEmail")}
          </Button>
        </Box>
      )}
    </FieldArray>
  );
};

export default EmailsInput;
