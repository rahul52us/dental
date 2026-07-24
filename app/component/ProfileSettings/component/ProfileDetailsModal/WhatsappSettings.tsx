import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Switch,
  useToast,
  Divider,
  Select,
} from "@chakra-ui/react";
import { CompanyStore } from "../../../../store/companyStore/companyStore";

import { authStore } from "../../../../store/authStore/authStore";

const WhatsappSettings = ({ user }: any) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    enabled: false,
    reminderTime: "07:00",
  });

  useEffect(() => {
    // Load existing settings if available
    const existingConfig = user?.companyDetail?.whatsappConfig || user?.companyDetails?.whatsappConfig;
    if (existingConfig) {
      setConfig((prev) => ({ ...prev, ...existingConfig }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setConfig({ ...config, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setConfig({ ...config, [name]: value });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await CompanyStore.updateWhatsappConfig({ whatsappConfig: config });
      toast({
        title: "Success",
        description: "WhatsApp settings updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Refresh user details to get the updated config
      await authStore.fetchUser();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to save settings.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <VStack spacing={5} align="stretch">
        <Box>
          <Text fontWeight="bold" fontSize="lg">WhatsApp Reminders Config</Text>
          <Text fontSize="sm" color="gray.500">Configure automated WhatsApp reminders for this clinic.</Text>
        </Box>
        <Divider />
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="whatsapp-enabled" mb="0" fontWeight="semibold">
            Enable Automated Reminders
          </FormLabel>
          <Switch
            id="whatsapp-enabled"
            name="enabled"
            colorScheme="green"
            isChecked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
          />
        </FormControl>

        {config.enabled && (
          <VStack spacing={4} align="stretch" mt={2} p={4} bg="gray.50" borderRadius="md" borderWidth="1px">
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold">Reminder Time</FormLabel>
              <Select
                name="reminderTime"
                value={config.reminderTime}
                onChange={handleChange}
                bg="white"
              >
                {Array.from({ length: 48 }).map((_, i) => {
                  const hour = Math.floor(i / 2).toString().padStart(2, '0');
                  const minute = i % 2 === 0 ? '00' : '30';
                  const timeStr = `${hour}:${minute}`;
                  return (
                    <option key={timeStr} value={timeStr}>
                      {timeStr}
                    </option>
                  );
                })}
              </Select>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Time of day when the automated reminders will be sent.
              </Text>
            </FormControl>
          </VStack>
        )}

        <Box textAlign="right" pt={2}>
          <Button colorScheme="blue" onClick={handleSave} isLoading={loading}>
            Save Configuration
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default WhatsappSettings;
