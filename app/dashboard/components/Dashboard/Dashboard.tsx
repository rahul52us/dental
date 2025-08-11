"use client";
import {
  Box,
  ChakraProvider,
  extendTheme,
  Grid,
  GridItem,
  Heading,
  SimpleGrid,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  FaAddressBook,
  FaComments,
  FaNewspaper,
  FaUsers,
} from "react-icons/fa";
import DashboardCard from "../common/DashboardCard/DashboardCard";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import stores from "../../../store/stores";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Extend Chakra UI theme (optional)
const theme = extendTheme({
  colors: {
    brand: {
      100: "#f7fafc",
      500: "#3182ce",
      900: "#1a365d",
    },
  },
});

// Dummy data
const dummyData = {
  visits: 1200,
  patients: 350,
  therapists: 25,
  appointments: 180,
  patientGrowth: [50, 230, 180, 210, 230, 370, 350],
  monthlyVisits: [100, 200, 150, 300, 250, 400, 500],
};

// Bar chart data
const barChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Monthly Visits",
      data: dummyData.monthlyVisits,
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
};

// Line chart data
const lineChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Patient Growth",
      data: dummyData.patientGrowth,
      borderColor: "rgba(153, 102, 255, 1)",
      backgroundColor: "rgba(153, 102, 255, 0.2)",
      borderWidth: 2,
    },
  ],
};

// Dashboard component
const Dashboard = observer(() => {
  const {
    dashboardStore: { getDashboardCount, count },
  } = stores;
  useEffect(() => {
    getDashboardCount();
  }, [getDashboardCount]);

  const dashboardData = [
    {
      label: "Blogs",
      value: count?.data?.blogs || 0,
      icon: FaNewspaper,
      color: "blue",
      href: "/dashboard/blogs",
    },
    {
      label: "Users",
      value: count?.data?.users || 0,
      icon: FaUsers,
      color: "green",
      href: "/dashboard/users",
    },
    {
      label: "Testimonials",
      value: count?.data?.testimonials || 0,
      icon: FaComments,
      color: "purple",
      href: "/dashboard/testimonials",
    },
    {
      label: "Contacts",
      value: count?.data?.contacts || 0,
      icon: FaAddressBook,
      color: "orange",
      href: "/dashboard/contacts",
    },
  ];

  return (
    <ChakraProvider theme={theme}>
      <Box p={5}>
        <Heading mb={5} size={"lg"} color={"teal.600"}>
          Dashboard
        </Heading>
        <Box mb={4}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {dashboardData.map((item, index) => (
              <Skeleton
                isLoaded={!count?.loading}
                key={index}
                borderRadius="lg"
              >
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

        <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={10}>
          <GridItem>
            <Box bg="white" p={5} borderRadius="lg" boxShadow="md">
              <Text fontSize="lg" fontWeight="bold" mb={5}>
                Monthly Visits
              </Text>
              <Bar data={barChartData} />
            </Box>
          </GridItem>
          <GridItem>
            <Box bg="white" p={5} borderRadius="lg" boxShadow="md">
              <Text fontSize="lg" fontWeight="bold" mb={5}>
                Patient Growth
              </Text>
              <Line data={lineChartData} />
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </ChakraProvider>
  );
});

export default Dashboard;