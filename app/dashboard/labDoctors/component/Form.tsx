"use client";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Select from "react-select";
import { genders, languagesList } from "./utils/constant";

const Form = ({ initialData, onSubmit, onClose, isEdit, loading }: any) => {
  const [formData, setFormData] = useState<any>(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        gender: genders.find((g) => g.value === initialData.gender) || initialData.gender,
        languages: initialData.languages?.map((l: any) => ({ label: l, value: l })) || [],
      });
    }
  }, [initialData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Lab Doctor Name</FormLabel>
          <Input
            name="labDoctorName"
            value={formData.labDoctorName}
            onChange={handleChange}
            placeholder="Enter name"
          />
        </FormControl>

        <SimpleGrid columns={2} spacing={4}>
          <FormControl>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              name="dob"
              value={formData.dob ? new Date(formData.dob).toISOString().split("T")[0] : ""}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Gender</FormLabel>
            <Select
              options={genders}
              value={formData.gender}
              onChange={(val) => handleSelectChange("gender", val)}
            />
          </FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Languages</FormLabel>
          <Select
            isMulti
            options={languagesList}
            value={formData.languages}
            onChange={(val) => handleSelectChange("languages", val)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Address</FormLabel>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
        </FormControl>

        <SimpleGrid columns={2} spacing={4}>
          <FormControl>
            <FormLabel>Mobile Number</FormLabel>
            <Input
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </FormControl>
        </SimpleGrid>

        <Box pt={4}>
          <Button
            width="full"
            colorScheme="blue"
            type="submit"
            isLoading={loading}
          >
            {isEdit ? "Update Lab Doctor" : "Add Lab Doctor"}
          </Button>
          <Button width="full" mt={2} onClick={onClose} variant="ghost">
            Cancel
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default Form;
