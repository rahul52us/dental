"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import {
  Box,
  Flex,
  Button,
  Badge,
  useToast,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import moment from "moment";
import { FaTrashAlt, FaBullhorn, FaPlus, FaTimes, FaEdit } from "react-icons/fa";
import CustomTable from "../../component/config/component/CustomTable/CustomTable";
import CustomInput from "../../component/config/component/customInput/CustomInput";

const MarketingCampaigns = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [scheduledDates, setScheduledDates] = useState<string[]>([""]);
  const [audience, setAudience] = useState<string[]>(["patient"]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyOptions, setCompanyOptions] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const cancelRef = useRef<any>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/marketing-campaign`);
      if (res.data.success) {
        setCampaigns(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to fetch campaigns", status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`/marketing-campaign/companies`);
      if (res.data.success) {
        setCompanyOptions(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchCompanies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validDates = scheduledDates.filter(d => d.trim() !== "");
    if (validDates.length === 0) {
      toast({ title: "Please select at least one date", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        templateName: templateName.trim(),
        scheduledDates: validDates,
        audience,
        company: companies
      };
      const res = editingId 
        ? await axios.put(`/marketing-campaign/${editingId}`, payload)
        : await axios.post(`/marketing-campaign`, payload);
        
      if (res.data.success) {
        toast({ title: `Campaign ${editingId ? 'updated' : 'scheduled'} successfully`, status: "success", duration: 3000, isClosable: true });
        onClose();
        setEditingId(null);
        setTemplateName("");
        setScheduledDates([""]);
        setAudience(["patient"]);
        setCompanies([]);
        fetchCampaigns();
      }
    } catch (error: any) {
      toast({ title: error.response?.data?.message || `Failed to ${editingId ? 'update' : 'schedule'} campaigns`, status: "error", duration: 3000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (campaign: any) => {
    setEditingId(campaign._id);
    setTemplateName(campaign.templateName);
    const dates = campaign.scheduledDates.map((d: string) => d.split("T")[0]);
    setScheduledDates(dates.length > 0 ? dates : [""]);
    
    // Convert old string audience to array if needed
    let parsedAudience = campaign.audience || ["patient"];
    if (typeof parsedAudience === 'string') {
      parsedAudience = [parsedAudience];
    }
    
    parsedAudience = parsedAudience.map((a: string) => {
       if (a === 'all_active_patients') return 'patient';
       if (a === 'all_active_doctors') return 'doctor';
       if (a === 'all_active_staff') return 'staff';
       if (a === 'all_active_admin') return 'admin';
       if (a === 'patients_and_doctors') return ['patient', 'doctor'];
       if (a === 'everyone') return ['patient', 'doctor', 'staff', 'admin'];
       return a;
    }).flat();

    setAudience(parsedAudience);
    setCompanies(campaign.company || []);
    
    onOpen();
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const res = await axios.delete(`/marketing-campaign/${deleteId}`);
      if (res.data.success) {
        toast({ title: "Campaign deleted", status: "success", duration: 3000, isClosable: true });
        fetchCampaigns();
      }
    } catch (error) {
      toast({ title: "Failed to delete campaign", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const columns = useMemo(() => [
    {
      headerName: "Template",
      key: "templateName",
      props: { row: { textAlign: "center" }, column: { textAlign: "center" } }
    },
    {
      headerName: "Audience",
      key: "audience",
      type: "component",
      metaData: {
        component: (dt: any) => {
          const audienceLabels: any = {
            'patient': 'Patients',
            'doctor': 'Doctors',
            'staff': 'Staff',
            'admin': 'Admins'
          };
          
          let audArray = dt.audience || ['patient'];
          if (typeof audArray === 'string') {
            if (audArray === 'everyone') audArray = ['patient', 'doctor', 'staff', 'admin'];
            else audArray = [audArray.replace('all_active_', '').replace('s', '')];
          }

          return (
            <Flex gap={2} justify="center" wrap="wrap">
              {audArray.map((aud: string, i: number) => (
                <Badge key={i} colorScheme="purple" px={2} py={1} borderRadius="md">
                  {audienceLabels[aud] || aud}
                </Badge>
              ))}
            </Flex>
          );
        }
      },
      props: { row: { textAlign: "center" }, column: { textAlign: "center" } }
    },
    {
      headerName: "Scheduled Dates",
      key: "scheduledDates",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
            {dt.scheduledDates?.map((date: string, index: number) => (
              <Badge key={index} colorScheme="teal" px={2} py={1} borderRadius="md">
                {moment(date).format("DD MMM YYYY")}
              </Badge>
            ))}
          </Box>
        )
      },
      props: { row: { textAlign: "center" }, column: { textAlign: "center" } }
    },
    {
      headerName: "Actions",
      key: "table-actions-custom",
      type: "component",
      metaData: {
        component: (dt: any) => (
          <Flex gap={2} justify="center">
            <IconButton
              aria-label="Edit Campaign"
              icon={<FaEdit />}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              borderRadius="xl"
              onClick={() => handleEditOpen(dt)}
            />
            <IconButton
              aria-label="Delete Campaign"
              icon={<FaTrashAlt />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              borderRadius="xl"
              onClick={() => confirmDelete(dt._id)}
            />
          </Flex>
        ),
      },
      props: {
        row: { textAlign: "center" },
        column: { textAlign: "center" },
      },
    },
  ], []);

  const tableData = useMemo(() => {
    return campaigns.map((c, index) => ({
      ...c,
      sno: index + 1
    }));
  }, [campaigns]);

  const tableActions = useMemo(() => ({
    actionBtn: {
      addKey: {
        showAddButton: true,
        function: () => {
          setEditingId(null);
          setTemplateName("");
          setScheduledDates([""]);
          setAudience(["patient"]);
          setCompanies([]);
          onOpen();
        },
      }
    },
    pagination: {
      show: false
    }
  }), [onOpen]);

  return (
    <Box p={4}>
      <CustomTable
        title="Marketing Campaigns"
        data={tableData}
        columns={columns}
        actions={tableActions}
        loading={loading}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color="white" />
          <DrawerHeader bg="teal.600" color="white">
            <Flex align="center" gap={3}>
              <FaBullhorn size="24px" />
              {editingId ? "Edit Campaign" : "Schedule New Campaign"}
            </Flex>
          </DrawerHeader>

          <DrawerBody mt={4}>
            <form id="campaign-form" onSubmit={handleCreate}>
              <FormControl mb={6}>
                <FormLabel fontWeight="medium" color="gray.700">Template Name</FormLabel>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. happy_diwali"
                  required
                  focusBorderColor="teal.500"
                  bg="gray.50"
                />
              </FormControl>

              <Box mb={6}>
                <CustomInput
                  type="select"
                  name="audience"
                  label="Audience"
                  isMulti={true}
                  options={[
                    { label: "Patients", value: "patient" },
                    { label: "Doctors", value: "doctor" },
                    { label: "Staff", value: "staff" },
                    { label: "Admins", value: "admin" }
                  ]}
                  value={Array.isArray(audience) ? audience.map(a => ({
                    label: a.charAt(0).toUpperCase() + a.slice(1),
                    value: a
                  })) : []}
                  onChange={(selected: any) => {
                    if (Array.isArray(selected)) {
                      setAudience(selected.map((item: any) => item.value));
                    } else {
                      setAudience([]);
                    }
                  }}
                />
              </Box>

              <Box mb={6}>
                <CustomInput
                  type="select"
                  name="companies"
                  label="Select Companies (Optional)"
                  isMulti={true}
                  options={companyOptions}
                  value={companyOptions.filter(opt => companies.includes(opt.value))}
                  onChange={(selected: any) => {
                    if (Array.isArray(selected)) {
                      setCompanies(selected.map((item: any) => item.value));
                    } else {
                      setCompanies([]);
                    }
                  }}
                />
              </Box>

              <FormControl>
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                  <FormLabel fontWeight="medium" color="gray.700" m={0}>Scheduled Dates</FormLabel>
                  <Button size="xs" leftIcon={<FaPlus />} colorScheme="teal" variant="outline" onClick={() => setScheduledDates([...scheduledDates, ""])}>
                    Add Date
                  </Button>
                </Flex>
                
                <Flex direction="column" gap={3}>
                  {scheduledDates.map((date, index) => (
                    <Flex key={index} gap={2} align="center">
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => {
                          const newDates = [...scheduledDates];
                          newDates[index] = e.target.value;
                          setScheduledDates(newDates);
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        focusBorderColor="teal.500"
                        bg="gray.50"
                      />
                      {scheduledDates.length > 1 && (
                        <IconButton
                          aria-label="Remove Date"
                          icon={<FaTimes />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => {
                            const newDates = scheduledDates.filter((_, i) => i !== index);
                            setScheduledDates(newDates);
                          }}
                        />
                      )}
                    </Flex>
                  ))}
                </Flex>
              </FormControl>
            </form>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" type="submit" form="campaign-form" isLoading={submitting}>
              {editingId ? "Update" : "Schedule"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)" bg="blackAlpha.300">
          <AlertDialogContent borderRadius="2xl" p={4} boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="bold" color="red.600" display="flex" alignItems="center" gap={3}>
              <FaTrashAlt /> Delete Campaign
            </AlertDialogHeader>

            <AlertDialogBody color="gray.600" fontSize="md">
              Are you sure you want to delete this campaign? This action cannot be undone and will permanently remove all scheduled dates.
            </AlertDialogBody>

            <AlertDialogFooter mt={4}>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)} variant="ghost" borderRadius="xl" isDisabled={isDeleting}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} borderRadius="xl" shadow="md" _hover={{ shadow: "lg", transform: "translateY(-1px)" }} transition="all 0.2s" isLoading={isDeleting} loadingText="Deleting...">
                Delete Permanently
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default MarketingCampaigns;
