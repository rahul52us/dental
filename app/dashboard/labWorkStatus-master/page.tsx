'use client';
import React from 'react';
import { Box, Heading, Text, VStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { FiChevronRight } from 'react-icons/fi';
import LabWorkStatusManager from '../masters/element/LabWorkStatusManager';
import DashPageHeader from '../../component/common/DashPageHeader/DashPageHeader';
import DashPageTitle from '../../component/common/DashPageTitle/DashPageTitle';

const LabWorkStatusMasterPage = () => {
  return (
    <Box p={4}>
      <DashPageTitle 
        title="Lab Work Status Master" 
        subTitle="Manage status workflows for In-house and Outside laboratory works" 
      />
      <Box mt={6} bg="white" p={6} borderRadius="2xl" boxShadow="xl">
        <LabWorkStatusManager />
      </Box>
    </Box>
  );
};

export default LabWorkStatusMasterPage;
