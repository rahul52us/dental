import React from "react";
import { Box, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { useTranslation } from "react-i18next";

interface AddressesInputProps {
  values: {
    addresses: {
      residential: string;
      office: string;
      other?: string;
    };
  };
  errors?: any;
  touched?: any;
  handleChange: any
}

const AddressesInput = ({
  values,
  errors,
  handleChange
}: AddressesInputProps) => {
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const textColor = useColorModeValue("black", "white");
  const { t } = useTranslation();

  return (
    <Box
      borderWidth={1}
      borderRadius="md"
      boxShadow="sm"
      bg={bgBox}
      mt={3}
      p={4}
    >
      <Text fontWeight="bold" fontSize="lg" mb={4} color={textColor}>
        {t("patients.form.addresses")}
      </Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <CustomInput
          label={t("patients.form.residentialAddress")}
          name="addresses.residential"
          placeholder={t("patients.form.enterResidentialAddress")}
          value={values.addresses?.residential}
          onChange={handleChange}
          error={errors?.addresses?.residential}
          showError={errors?.addresses?.residential}
        />
        <CustomInput
          label={t("patients.form.officeAddress")}
          name="addresses.office"
          placeholder={t("patients.form.enterOfficeAddress")}
          value={values.addresses?.office}
          onChange={handleChange}
          error={errors?.addresses?.office}
          showError={errors?.addresses?.office}
        />
        <CustomInput
          label={t("patients.form.otherAddress")}
          name="addresses.other"
          placeholder={t("patients.form.enterOtherAddress")}
          value={values.addresses?.other || ""}
          onChange={handleChange}
          error={errors?.addresses?.other}
          showError={errors?.addresses?.other}
        />
      </SimpleGrid>
    </Box>
  );
};

export default AddressesInput;
