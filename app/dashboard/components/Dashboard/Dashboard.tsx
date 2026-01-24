"use client";
import {
  Box,
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
  ArcElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { FaUserMd, FaUserInjured, FaUserTie } from "react-icons/fa";
import DashboardCard from "../common/DashboardCard/DashboardCard";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import stores from "../../../store/stores";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
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

const dummyData = {
  visits: 1200,
  patients: 350,
  therapists: 25,
  appointments: 180,
  patientGrowth: [50, 230, 180, 210, 230, 370, 350],
  monthlyVisits: [100, 200, 150, 300, 250, 400, 500],
};

const chartColors = [
  { bg: "#2B6CB0", border: "#2C5282" },
  { bg: "#38A169", border: "#2F855A" },
  { bg: "#DD6B20", border: "#C05621" }
];


const barChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      backgroundColor: '#1A202C',
      titleFont: { family: "'Inter', sans-serif", size: 13 },
      bodyFont: { family: "'Inter', sans-serif", size: 13 },
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#E2E8F0',
        borderDash: [5, 5],
        drawBorder: false,
      },
      ticks: {
        font: { family: "'Inter', sans-serif", size: 11 },
        color: '#718096',
        padding: 10
      },
      border: { display: false }
    },
    x: {
      grid: { display: false },
      ticks: {
        font: { family: "'Inter', sans-serif", size: 11 },
        color: '#718096'
      },
      border: { display: false }
    },
  },
  layout: { padding: 0 },
  elements: {
    bar: {
      borderRadius: 6,
      borderSkipped: false,
    },
  },
};

const lineChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      backgroundColor: '#1A202C',
      titleFont: { family: "'Inter', sans-serif", size: 13 },
      bodyFont: { family: "'Inter', sans-serif", size: 13 },
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
      intersect: false,
      mode: 'index',
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: '#E2E8F0',
        borderDash: [5, 5],
        drawBorder: false,
      },
      ticks: {
        font: { family: "'Inter', sans-serif", size: 11 },
        color: '#718096',
        padding: 10
      },
      border: { display: false }
    },
    x: {
      grid: { display: false },
      ticks: {
        font: { family: "'Inter', sans-serif", size: 11 },
        color: '#718096'
      },
      border: { display: false }
    },
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 3,
    },
    point: {
      radius: 0,
      hoverRadius: 6,
      hoverBorderWidth: 4,
      hoverBorderColor: '#fff',
    },
  },
};

const lineChartData: any = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Growth",
      data: dummyData.patientGrowth,
      borderColor: "#805AD5", // Purple 500
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(128, 90, 213, 0.4)");
        gradient.addColorStop(1, "rgba(128, 90, 213, 0.0)");
        return gradient;
      },
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
    icon: FaUserMd,
    color: "blue",
    href: "/dashboard/doctors",
  },
  {
    label: "Patients",
    value: count?.data?.patients || 0,
    icon: FaUserInjured,
    color: "green",
    href: "/dashboard/patients",
  },
  {
    label: "Staff",
    value: count?.data?.staffs || 0,
    icon: FaUserTie,
    color: "purple",
    href: "/dashboard/staffs",
  },
];


  // Dynamic color handling for bar chart
  const userChartData = {
    labels: dashboardData.map((d) => d.label),
    datasets: [
      {
        label: "Count",
        data: dashboardData.map((d) => d.value),
        backgroundColor: [
          "rgba(49, 130, 206, 0.8)", // Blue
          "rgba(56, 161, 105, 0.8)", // Green
          "rgba(128, 90, 213, 0.8)", // Purple
        ],
        hoverBackgroundColor: [
          "rgba(49, 130, 206, 1)",
          "rgba(56, 161, 105, 1)",
          "rgba(128, 90, 213, 1)",
        ],
        borderRadius: 8,
        barThickness: 45,
        borderWidth: 0,
      },
    ],
  };

  return (
      <Box p={5} minH="100vh">
        <Box mx="auto">
          <Heading mb={8} size="lg" color="blue.800" letterSpacing="tight">
            Dashboard
          </Heading>

          {/* Cards Section */}
          <Box mb={10}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {dashboardData.map((item, index) => (
                <Skeleton
                  isLoaded={!count?.loading}
                  key={index}
                  borderRadius="xl"
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
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} mb={10}>
            {/* Bar Chart */}
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.100"
            >
              <Text fontSize="lg" fontWeight="bold" mb={6} color="gray.700">
                Users Overview
              </Text>
              <AspectRatio ratio={16 / 9} width="100%">
                <Bar data={userChartData} options={barChartOptions} />
              </AspectRatio>
            </Box>

            {/* Line Chart */}
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.100"
            >
              <Text fontSize="lg" fontWeight="bold" mb={6} color="gray.700">
                Patient Growth
              </Text>
              <AspectRatio ratio={16 / 9} width="100%">
                <Line data={lineChartData} options={lineChartOptions} />
              </AspectRatio>
            </Box>
          </Grid>
        </Box>
      </Box>
  );
});

export default Dashboard;