"use client";

import { Box, Heading, VStack, FormControl, FormLabel, Input, Button, Image, Flex, useToast, Spinner, Select, Text, Avatar, HStack, Icon, Divider } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import stores from '../../store/stores';
import { FiCamera, FiUpload, FiSave } from 'react-icons/fi';

const GlobalSettingsPage = observer(() => {
  const { globalConfigStore, auth } = stores;
  const toast = useToast();

  const [paymentQrCodePreview, setPaymentQrCodePreview] = useState('');
  const [globalLogoPreview, setGlobalLogoPreview] = useState('');
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');
  const [amPm, setAmPm] = useState('AM');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only superadmins should access this page
    if (auth.user && auth.user.role !== 'superadmin' && auth.user.role !== 'superAdmin') {
       window.location.href = '/dashboard';
    }
  }, [auth.user]);

  useEffect(() => {
    globalConfigStore.fetchGlobalConfig().then(() => {
      const config = globalConfigStore.config;
      if (config) {
        setPaymentQrCodePreview(config.paymentQrCode || '');
        setGlobalLogoPreview(config.globalLogo || '');
        
        if (config.cronTime) {
          const [hoursStr, minutesStr] = config.cronTime.split(':');
          let hours = parseInt(hoursStr || '7', 10);
          const mins = minutesStr || '00';
          let period = 'AM';
          
          if (hours >= 12) {
            period = 'PM';
            if (hours > 12) hours -= 12;
          } else if (hours === 0) {
            hours = 12;
          }
          
          setHour(hours.toString().padStart(2, '0'));
          setMinute(mins);
          setAmPm(period);
        }
      }
    });
  }, []);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const buffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const uploadResult = await auth.uploadFile({
        file: { buffer, filename: file.name, type: file.type },
        folder: "global-logos",
      });
      const newUrl = uploadResult?.data || uploadResult?.url || uploadResult;
      setGlobalLogoPreview(newUrl);
    } catch (error) {
      toast({ title: "Upload Failed", status: "error", duration: 3000, isClosable: true });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleQrUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const buffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const uploadResult = await auth.uploadFile({
        file: { buffer, filename: file.name, type: file.type },
        folder: "qrcodes",
      });
      const newUrl = uploadResult?.data || uploadResult?.url || uploadResult;
      setPaymentQrCodePreview(newUrl);
    } catch (error) {
      toast({ title: "Upload Failed", status: "error", duration: 3000, isClosable: true });
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSave = async () => {
    let parsedHour = parseInt(hour, 10);
    
    if (amPm === 'PM' && parsedHour !== 12) parsedHour += 12;
    if (amPm === 'AM' && parsedHour === 12) parsedHour = 0;
    
    const formattedTime = `${parsedHour.toString().padStart(2, '0')}:${minute}`;
    
    const payload = {
      globalLogo: globalLogoPreview,
      paymentQrCode: paymentQrCodePreview,
      cronTime: formattedTime,
    };
    
    const res = await globalConfigStore.updateGlobalConfig(payload);
    if (res.success) {
      toast({ title: "Settings saved successfully", status: "success", duration: 3000, isClosable: true });
    } else {
      toast({ title: res.message || "Failed to save", status: "error", duration: 3000, isClosable: true });
    }
  };

  if (globalConfigStore.isLoading) {
    return <Flex justify="center" align="center" h="50vh"><Spinner size="xl" /></Flex>;
  }

  return (
    <Box p={4} w="100%" mx="auto">
      <Heading mb={4} color="gray.700" size="lg">Global Configuration</Heading>
      
      <VStack spacing={5} align="stretch" bg="white" p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
        
        {/* Global Logo Section */}
        <Box>
          <Flex align="center" justify="space-between" mb={2}>
            <HStack spacing={4} w="full">
              <Avatar
                size="xl"
                src={globalLogoPreview}
                bg="teal.500"
                icon={<Icon as={FiCamera} fontSize="1.5rem" />}
                cursor="pointer"
                onClick={() => logoInputRef.current?.click()}
                boxShadow="md"
              />
              <Box>
                <Text fontWeight="bold" fontSize="lg" color="gray.800">Global Logo</Text>
                <Text fontSize="sm" color="gray.500">This logo will be used globally for all companies across the app.</Text>
              </Box>
            </HStack>
            <Button
              size="md"
              colorScheme="teal"
              leftIcon={<Icon as={FiUpload} />}
              onClick={() => logoInputRef.current?.click()}
              isLoading={uploadingLogo}
            >
              Update Logo
            </Button>
            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} style={{ display: 'none' }} accept="image/*" />
          </Flex>
        </Box>

        <Divider borderColor="gray.200" />

        {/* Payment QR Section */}
        <Box>
          <Flex align="flex-start" justify="space-between" direction={{ base: 'column', md: 'row' }} gap={4}>
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">Payment QR Code</Text>
              <Text fontSize="sm" color="gray.500" mb={4}>This QR code will be shown in the "Make a Payment" modal globally.</Text>
              <Button
                size="md"
                colorScheme="blue"
                variant="outline"
                leftIcon={<Icon as={FiUpload} />}
                onClick={() => qrInputRef.current?.click()}
                isLoading={uploadingQr}
              >
                Upload QR Code
              </Button>
              <input type="file" ref={qrInputRef} onChange={handleQrUpload} style={{ display: 'none' }} accept="image/*" />
            </Box>
            <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50" shadow="sm" minW="200px" minH="200px" display="flex" alignItems="center" justifyContent="center">
              {paymentQrCodePreview ? (
                <Image src={paymentQrCodePreview} alt="Payment QR" maxH="180px" borderRadius="md" />
              ) : (
                <Text color="gray.400" fontSize="sm">No QR Code uploaded</Text>
              )}
            </Box>
          </Flex>
        </Box>

        <Divider borderColor="gray.200" />

        {/* Cron Job Time Section */}
        <Box>
          <Text fontWeight="bold" fontSize="lg" color="gray.800" mb={1}>WhatsApp Reminder Schedule</Text>
          <Text fontSize="sm" color="gray.500" mb={4}>Set the time when daily WhatsApp reminders should be sent automatically.</Text>
          <Flex gap={4} maxW="350px" align="center">
            <Select 
              value={hour} 
              onChange={(e) => setHour(e.target.value)} 
              w="100px" 
              size="lg"
              bg="gray.50"
              focusBorderColor="teal.400"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const val = (i + 1).toString().padStart(2, '0');
                return <option key={val} value={val}>{val}</option>;
              })}
            </Select>
            <Text fontSize="xl" fontWeight="bold">:</Text>
            <Select 
              value={minute} 
              onChange={(e) => setMinute(e.target.value)} 
              w="100px" 
              size="lg"
              bg="gray.50"
              focusBorderColor="teal.400"
            >
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </Select>
            <Select 
              value={amPm} 
              onChange={(e) => setAmPm(e.target.value)} 
              w="100px" 
              size="lg"
              bg="gray.50"
              focusBorderColor="teal.400"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </Select>
          </Flex>
        </Box>
        
        <Box pt={4}>
          <Button 
            colorScheme="teal" 
            size="lg" 
            onClick={handleSave} 
            isLoading={globalConfigStore.isLoading}
            leftIcon={<Icon as={FiSave} />}
            w={{ base: "full", md: "auto" }}
          >
            Save Global Settings
          </Button>
        </Box>
      </VStack>
    </Box>
  );
});

export default GlobalSettingsPage;
