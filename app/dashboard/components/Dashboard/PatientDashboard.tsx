'use client';
import {
  Box,
  ChakraProvider,
  extendTheme,
  Grid,
  Heading,
  SimpleGrid,
  Skeleton,
  Text,
  AspectRatio,
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { FaClipboardList, FaCalendarCheck, FaPrescriptionBottle } from "react-icons/fa";
import DashboardCard from "../common/DashboardCard/DashboardCard";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import stores from "../../../store/stores";

const theme = extendTheme({
  colors: {
    brand: {
      100: "#f7fafc",
      500: "#3182ce",
      900: "#1a365d",
    },
  },
});

const PatientDashboard = observer(() => {
  const {
    dashboardStore: { getPatientDashboardCount, patientCount },
  } = stores;


  useEffect(() => {
    getPatientDashboardCount();
  }, [getPatientDashboardCount]);

  // Example patient dashboard data
  const dashboardData = [
    {
      label: "Appointments",
      value: patientCount?.data?.appointments || 0,
      icon: FaCalendarCheck,
      color: "blue",
      href: "/dashboard/appointments",
    },
    {
      label: "Orders",
      value: patientCount?.data?.orders || 0,
      icon: FaClipboardList,
      color: "green",
      href: "/dashboard/orders",
    },
    {
      label: "Prescriptions",
      value: patientCount?.data?.prescriptions || 0,
      icon: FaPrescriptionBottle,
      color: "purple",
      href: "/patient/prescriptions",
    },
  ];

  // Chart data
  const chartColors = [
    { bg: "#2B6CB0", border: "#2C5282" },
    { bg: "#38A169", border: "#2F855A" },
    { bg: "#DD6B20", border: "#C05621" },
  ];

  const barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { position: "top" }, title: { display: false } },
    scales: { y: { beginAtZero: true }, x: { ticks: { autoSkip: true, maxTicksLimit: 12 } } },
    layout: { padding: 8 },
  };

  const userChartData = {
    labels: dashboardData.map((d) => d.label),
    datasets: [
      {
        label: "Patient Activities",
        data: dashboardData.map((d) => d.value),
        backgroundColor: dashboardData.map((_, i) => chartColors[i % chartColors.length].bg),
        borderColor: dashboardData.map((_, i) => chartColors[i % chartColors.length].border),
        borderWidth: 2,
      },
    ],
  };

  return (
    <ChakraProvider theme={theme}>
      <Box p={5}>
        <Heading mb={5} size={"lg"} color={"teal.600"}>
          Patient Dashboard
        </Heading>

        {/* Cards Section */}
        <Box mb={4}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {dashboardData.map((item, index) => (
              <Skeleton isLoaded={!patientCount?.loading} key={index} borderRadius="lg">
                <DashboardCard
                  label={item.label}
                  href={item.href}
                  value={item.value}
                  icon={item.icon}
                  color={item.color}
                />
              </Skeleton>
            ))}
          </SimpleGrid>
        </Box>

        {/* Chart Section */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          <Box bg="white" p={5} borderRadius="lg" boxShadow="md" overflow="hidden">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Activities Overview
            </Text>
            <AspectRatio ratio={16 / 9}>
              <Bar data={userChartData} options={barChartOptions} />
            </AspectRatio>
          </Box>
        </Grid>
      </Box>
    </ChakraProvider>
  );
});

export default PatientDashboard;
