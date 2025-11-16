"use client";

import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../store/stores";

import PatientDashboard from "./components/Dashboard/PatientDashboard";
import DoctorDashboard from "./components/Dashboard/DoctorDashboard";
import StaffDashboard from "./components/Dashboard/StaffDashboard";
import Dashboard from "./components/Dashboard/Dashboard";

const Page = observer(() => {
  const {
    auth: { user },
  } = stores;

  const renderDashboard = () => {
    switch (user?.userType) {
      case "patient":
        return <PatientDashboard />;
      case "doctor":
        return <DoctorDashboard />;
      case "staff":
        return <StaffDashboard />;
      case "admin":
        return <Dashboard />;
      case "superAdmin":
        return <Dashboard />;
      default:
        return <Box>No dashboard available</Box>;
    }
  };

  return <Box>{renderDashboard()}</Box>;
});

export default Page;