"use client";
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

// Extend Chakra UI theme
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

// Chart options (responsive + preserve aspect ratio)
const barChartOptions : any = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: "top" },
    title: { display: false },
  },
  scales: {
    y: { beginAtZero: true },
    x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
  },
  layout: { padding: 8 },
};

const lineChartOptions : any = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: "top" },
    title: { display: false },
  },
  scales: {
    y: { beginAtZero: false },
    x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
  },
  layout: { padding: 8 },
};

// Chart data
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

const lineChartData : any = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Patient Growth",
      data: dummyData.patientGrowth,
      borderColor: "rgba(153, 102, 255, 1)",
      backgroundColor: "rgba(153, 102, 255, 0.15)",
      borderWidth: 2,
      fill: true,
    },
  ],
};

const Dashboard = observer(() => {
  const {
    dashboardStore: { getDashboardCount, count },
  } = stores;

  useEffect(() => {
    getDashboardCount();
  }, [getDashboardCount]);

  const dashboardData = [
    {
      label: "Doctors",
      value: count?.data?.doctors || 0,
      icon: FaNewspaper,
      color: "blue",
      href: "/dashboard/doctors",
    },
    {
      label: "Patients",
      value: count?.data?.patients || 0,
      icon: FaUsers,
      color: "green",
      href: "/dashboard/patients",
    },
    {
      label: "Staff",
      value: count?.data?.staffs || 0,
      icon: FaComments,
      color: "purple",
      href: "/dashboard/staffs",
    }
  ];

  return (
    <ChakraProvider theme={theme}>
      <Box p={5}>
        <Heading mb={5} size={"lg"} color={"teal.600"}>
          Dashboard
        </Heading>

        {/* Cards Section */}
        <Box mb={4}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
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

        {/* Charts Section */}
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          gap={6}
          mb={10}
        >
          {/* Bar Chart */}
          <Box bg="white" p={5} borderRadius="lg" boxShadow="md" overflow="hidden">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Monthly Visits
            </Text>

            {/* AspectRatio keeps the chart inside the box and prevents overflow */}
            <AspectRatio ratio={16 / 9} width="100%">
              <Bar
                data={barChartData}
                options={barChartOptions}
                style={{ width: "100%", height: "100%" }}
              />
            </AspectRatio>
          </Box>

          {/* Line Chart */}
          <Box bg="white" p={5} borderRadius="lg" boxShadow="md" overflow="hidden">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Patient Growth
            </Text>

            <AspectRatio ratio={16 / 9} width="100%">
              <Line
                data={lineChartData}
                options={lineChartOptions}
                style={{ width: "100%", height: "100%" }}
              />
            </AspectRatio>
          </Box>
        </Grid>
      </Box>
    </ChakraProvider>
  );
});

export default Dashboard;
