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
  Alert,
  AlertIcon,
  AlertDescription,
  Code,
  useClipboard,
  Link,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { FiCopy, FiCheck, FiExternalLink } from "react-icons/fi";
import { CompanyStore } from "../../../../store/companyStore/companyStore";
import CustomInput from "../../../config/component/customInput/CustomInput";

import { authStore } from "../../../../store/authStore/authStore";

const WhatsappSettings = ({ user }: any) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    enabled: false,
    reminderTime: "07:00",
  });
  const [credentials, setCredentials] = useState({
    user: "",
    pass: "",
    sender: "",
  });

  const clinicName = user?.companyDetail?.name || user?.companyDetails?.name || "[Clinic Name]";
  const phone = user?.companyDetail?.phone || user?.companyDetails?.phone || user?.companyDetail?.contactNumber || user?.companyDetails?.contactNumber || "[Your Mobile Number]";
  const shortName = clinicName === "[Clinic Name]" ? "[Clinic Name]" : (clinicName.includes(" ") ? clinicName.split(" ")[0] : clinicName);

  const templateText = `Dear {{1}}, This is a reminder of your appointment scheduled for {{2}} at {{3}} with ${clinicName}. If you need to reschedule please call on ${phone}. Thank you, Team ${shortName}. Do Not reply to the message, only call.`;
  const { hasCopied, onCopy } = useClipboard(templateText);

  useEffect(() => {
    // Load existing settings if available
    const existingConfig = user?.companyDetail?.whatsappConfig || user?.companyDetails?.whatsappConfig;
    if (existingConfig) {
      setConfig((prev) => ({ ...prev, ...existingConfig }));
      if (existingConfig.watsappMessageCredentails) {
        setCredentials((prev) => ({ ...prev, ...existingConfig.watsappMessageCredentails }));
      }
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

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const finalConfig = {
        ...config,
        watsappMessageCredentails: credentials,
      };
      await CompanyStore.updateWhatsappConfig({ whatsappConfig: finalConfig });
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
        
        <Box>
          <Text fontWeight="semibold" fontSize="md" mb={3}>BhashSMS API Credentials</Text>
          <VStack spacing={3}>
            <CustomInput
              name="user"
              label="User ID"
              value={credentials.user}
              onChange={handleCredentialsChange}
              placeholder="Enter API User ID"
            />
            <CustomInput
              name="pass"
              label="Password"
              type="password"
              value={credentials.pass}
              onChange={handleCredentialsChange}
              placeholder="Enter API Password"
            />
            <CustomInput
              name="sender"
              label="Sender ID"
              value={credentials.sender}
              onChange={handleCredentialsChange}
              placeholder="Enter 6-character Sender ID"
            />
          </VStack>
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

            <Alert status="info" borderRadius="md" mt={2} alignItems="flex-start">
              <AlertIcon mt={1} />
              <Box>
                <Text fontWeight="semibold" fontSize="sm">Required BhashSMS Template</Text>
                <AlertDescription fontSize="xs" display="block" mt={1}>
                  Make sure to create a template named <Code bg="yellow.200" color="black" px={2} py={0.5} borderRadius="md" fontWeight="bold" fontSize="sm" border="1px solid" borderColor="yellow.400">daily_appointment_update</Code> in your BhashSMS dashboard.
                  <br /><br />
                  <Text fontWeight="bold" mb={1}>Example Template Format:</Text>
                  <Box position="relative" p={3} bg="white" borderRadius="md" borderWidth="1px" borderColor="blue.200">
                    <Text fontSize="xs" color="gray.700" pr={8}>
                      {templateText}
                    </Text>
                    <Tooltip label={hasCopied ? "Copied!" : "Copy Template"} placement="top">
                      <IconButton
                        aria-label="Copy template text"
                        icon={hasCopied ? <FiCheck /> : <FiCopy />}
                        size="xs"
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={onCopy}
                        colorScheme={hasCopied ? "green" : "gray"}
                        variant="ghost"
                      />
                    </Tooltip>
                  </Box>
                  <Box mt={2}>
                    <Text as="span" fontStyle="italic" display="block">
                      Variables used: <b>{"{{1}}"}</b> = Patient Name, <b>{"{{2}}"}</b> = Date, <b>{"{{3}}"}</b> = Time
                    </Text>
                    <Text as="span" fontSize="xs" color="orange.600" fontWeight="semibold" display="block" mt={1}>
                      💡 Note: You can customize the Clinic Name and Phone Number in BhashSMS, but the variables {"{{1}}, {{2}}, {{3}}"} must be kept exactly as shown.
                    </Text>
                  </Box>
                  <Box mt={3} p={3} bg="gray.100" borderRadius="md" borderWidth="1px" borderColor="gray.300">
                    <Text fontWeight="bold" mb={1} fontSize="xs" color="gray.600">How it looks to the patient:</Text>
                    <Text fontSize="xs" color="gray.700" fontStyle="italic">
                      "Dear Rahul, This is a reminder of your appointment scheduled for 18-Oct-2023 at 10:30 AM with {clinicName === '[Clinic Name]' ? "Dr. Virmani's Dental Centre, Rohini" : clinicName}. If you need to reschedule please call on {phone === '[Your Mobile Number]' ? "8851793132" : phone}. Thank you, Team {shortName === '[Clinic Name]' ? "Dr. Virmani" : shortName}. Do Not reply to the message, only call."
                    </Text>
                  </Box>
                  <Box mt={3}>
                    <Button
                      as={Link}
                      href="https://bhashsms.com/"
                      isExternal
                      size="xs"
                      colorScheme="blue"
                      rightIcon={<FiExternalLink />}
                      _hover={{ textDecoration: "none" }}
                    >
                      Create Template on BhashSMS
                    </Button>
                  </Box>
                </AlertDescription>
              </Box>
            </Alert>
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
