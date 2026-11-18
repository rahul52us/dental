'use client';
import React from 'react';
import { Box } from '@chakra-ui/react';
import LabWorkStatusManager from '../masters/element/LabWorkStatusManager';
import DashPageTitle from '../../component/common/DashPageTitle/DashPageTitle';

const LabWorkStatusMasterPage = () => {
  return (
    <Box p={{ base: 2, sm: 3, md: 6 }}>
      <Box display={{ base: "none", md: "block" }}>
        <DashPageTitle 
          title="Lab Work Status Master" 
          subTitle="Manage status workflows for In-house and Outside laboratory works" 
        />
      </Box>
      <Box mt={{ base: 0, md: 6 }} bg={{ base: "transparent", md: "white" }} p={{ base: 0, md: 6 }} borderRadius={{ base: "none", md: "2xl" }} boxShadow={{ base: "none", md: "xl" }}>
        <LabWorkStatusManager />
      </Box>
    </Box>
  );
};

export default LabWorkStatusMasterPage;