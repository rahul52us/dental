"use client";
import {
  Box,
  Grid,
  Heading,
  SimpleGrid,
  Skeleton,
  Text,
  AspectRatio,
  Flex,
  Icon,
  useColorModeValue,
  Avatar,
  Badge,
  HStack,
  Divider,
  VStack,
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
import {
  FaUserMd,
  FaUserInjured,
  FaUserTie,
  FaStore,
  FaCalendarAlt,
  FaClipboardList,
  FaArrowRight
} from "react-icons/fa";
import DashboardCard from "../common/DashboardCard/DashboardCard";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import stores from "../../../store/stores";
import { motion } from "framer-motion";

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

const MotionBox = motion(Box);

const barChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1A202C',
      padding: 12,
      cornerRadius: 12,
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 },
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#E2E8F0', borderDash: [5, 5], drawBorder: false },
      ticks: { font: { size: 11 }, color: '#718096' }
    },
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#718096' } },
  },
};

const lineChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1A202C', padding: 12, cornerRadius: 12 },
  },
  scales: {
    y: { grid: { color: '#E2E8F0', borderDash: [5, 5] }, ticks: { font: { size: 11 }, color: '#718096' } },
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#718096' } },
  },
  elements: {
    line: { tension: 0.4, borderWidth: 3 },
    point: { radius: 0, hoverRadius: 6 },
  },
};

const Dashboard = observer(() => {
  const {
    dashboardStore: { getDashboardCount, count },
    auth: { user }
  } = stores;

  useEffect(() => {
    getDashboardCount();
  }, [getDashboardCount]);

  const dashboardData = [
    { label: "Doctors", value: count?.data?.doctors || 0, icon: FaUserMd, color: "blue", href: "/dashboard/doctors" },
    { label: "Patients", value: count?.data?.patients || 0, icon: FaUserInjured, color: "green", href: "/dashboard/patients" },
    { label: "Staff", value: count?.data?.staffs || 0, icon: FaUserTie, color: "purple", href: "/dashboard/staffs" },
    { label: "Dealers", value: count?.data?.dealers || 0, icon: FaStore, color: "orange", href: "/dashboard/dealers" },
  ];

  const weeklyGrowthData = useMemo(() => {
    const growth = count?.data?.growth || [];
    return {
      labels: growth.map((g: any) => {
        const date = new Date(g._id);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        label: "New Users",
        data: growth.map((g: any) => g.count),
        backgroundColor: stores.themeStore.themeConfig.colors.custom.light.primary + "CC",
        borderRadius: 8,
        barThickness: 30,
      }]
    };
  }, [count?.data?.growth]);

  const lineChartData = useMemo(() => {
    const trends = count?.data?.appointmentTrends || [];
    return {
      labels: trends.map((t: any) => {
        const [year, month] = (t._id || "").split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString("en-US", { month: "short" });
      }),
      datasets: [
        {
          label: "Completed Appointments",
          data: trends.map((t: any) => t.count),
          borderColor: "#2D3748",
          backgroundColor: "rgba(49, 151, 149, 0.2)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#319795",
        },
      ],
    };
  }, [count?.data?.appointmentTrends]);

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  }, []);

  return (
    <Box p={8} minH="100vh" bg={useColorModeValue("gray.50", "#0B0E14")} position="relative" overflowX="hidden">
      {/* Premium Background Glows */}
      <Box position="absolute" top="-10%" left="-10%" w="500px" h="500px" bg={stores.themeStore.themeConfig.colors.custom.light.primary} filter="blur(150px)" opacity={0.08} borderRadius="full" pointerEvents="none" />
      <Box position="absolute" bottom="0" right="-10%" w="600px" h="600px" bg={stores.themeStore.themeConfig.colors.custom.light.primary} filter="blur(150px)" opacity={0.08} borderRadius="full" pointerEvents="none" />

      <Box mx="auto" position="relative" zIndex={1}>
        <Flex justify="space-between" align="center" mb={12}>
          <Box>
            <Text fontSize="xs" fontWeight="900" color={stores.themeStore.themeConfig.colors.custom.light.primary} textTransform="uppercase" letterSpacing="widest" mb={1}>{currentDate}</Text>
            <Heading size="xl" letterSpacing="tight" color={useColorModeValue("gray.900", "white")}>
              Welcome back, {user?.name?.split(' ')[0] || "Admin"}! 👋
            </Heading>
            <Text color="gray.500" fontWeight="600" mt={1}>Here is your clinic analytics overview.</Text>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} mb={12}>
          {dashboardData.map((item, index) => (
            <Skeleton isLoaded={!count?.loading} key={index} borderRadius="3xl">
              <DashboardCard {...item} />
            </Skeleton>
          ))}
        </SimpleGrid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} mb={10}>
          <Box bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={8} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)">
            <Flex justify="space-between" align="center" mb={8}>
              <Box>
                <Text fontSize="xl" fontWeight="900" color={stores.themeStore.themeConfig.colors.custom.light.primary}>Weekly Growth</Text>
                <Text fontSize="xs" color="gray.500" fontWeight="700">New arrivals across all categories</Text>
              </Box>
              <Box p={2.5} bg={stores.themeStore.themeConfig.colors.custom.light.primary + "1A"} color={stores.themeStore.themeConfig.colors.custom.light.primary} borderRadius="xl">
                <Icon as={FaClipboardList} boxSize={5} />
              </Box>
            </Flex>
            <AspectRatio ratio={16 / 9} width="100%">
              <Bar data={weeklyGrowthData} options={barChartOptions} />
            </AspectRatio>
          </Box>

          <Box bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={8} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)">
            <Flex justify="space-between" align="center" mb={8}>
              <Box>
                <Text fontSize="xl" fontWeight="900" bgGradient="linear(to-r, green.400, teal.400)" bgClip="text">Patient Retention</Text>
                <Text fontSize="xs" color="gray.500" fontWeight="700">Clinical performance trend</Text>
              </Box>
              <Box p={2.5} bg="green.50" color="green.500" borderRadius="xl">
                <Icon as={FaCalendarAlt} boxSize={5} />
              </Box>
            </Flex>
            <AspectRatio ratio={16 / 9} width="100%">
              <Line data={lineChartData} options={lineChartOptions} />
            </AspectRatio>
          </Box>
        </Grid>

        <Box bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={10} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)" position="relative">
          <Box position="absolute" top="-20px" left="20px" bg={stores.themeStore.themeConfig.colors.custom.light.primary} color="white" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="900" boxShadow="lg">REAL-TIME MONITOR</Box>
          <Flex justify="space-between" align="center" mb={12} pt={4}>
            <Box>
              <Text fontSize="2xl" fontWeight="900" color={stores.themeStore.themeConfig.colors.custom.light.primary} mb={1}>Live Clinic Activity</Text>
              <Text fontSize="sm" color="gray.500" fontWeight="700">Detailed overview of latest user registrations and registrations times.</Text>
            </Box>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {count?.data?.recentUsers?.map((u: any, idx: number) => {
              const regDate = new Date(u.createdAt);
              const formattedDate = regDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              const formattedTime = regDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const dayName = regDate.toLocaleDateString('en-GB', { weekday: 'long' });
              
              const typeColors: any = {
                doctor: { bg: "blue.50", color: "blue.600", icon: FaUserMd },
                patient: { bg: "green.50", color: "green.600", icon: FaUserInjured },
                staff: { bg: "purple.50", color: "purple.600", icon: FaUserTie },
                dealer: { bg: "orange.50", color: "orange.600", icon: FaStore },
              };
              const style = typeColors[u.userType?.toLowerCase()] || { bg: "gray.50", color: "gray.600", icon: FaArrowRight };

              return (
                <MotionBox
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut",
                    delay: idx * 0.1 
                  }}
                  p={6}
                  bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor="transparent"
                  _hover={{ borderColor: style.color, transform: 'translateY(-4px)', boxShadow: 'xl', bg: useColorModeValue("white", "whiteAlpha.100") }}
                >
                  <Flex gap={5} align="start">
                    <Box position="relative">
                      <Avatar size="lg" src={u.pic?.url} name={u.name} borderRadius="2xl" border="3px solid" borderColor={style.color} />
                      <Box position="absolute" bottom="-2px" right="-2px" boxSize={6} bg={style.bg} color={style.color} borderRadius="lg" display="flex" alignItems="center" justifyContent="center" borderWidth="2px" borderColor={useColorModeValue("white", "gray.800")}>
                        <Icon as={style.icon} boxSize={3} />
                      </Box>
                    </Box>
                    <Box flex={1}>
                      <Flex justify="space-between" align="start">
                         <Box>
                            <Text fontSize="lg" fontWeight="900" color={useColorModeValue("gray.800", "white")} mb={1}>{u.name}</Text>
                            <Badge variant="subtle" colorScheme={style.color.split('.')[0]} fontSize="10px" px={3} py={0.5} borderRadius="full" fontWeight="900" textTransform="uppercase" letterSpacing="1px">{u.userType}</Badge>
                         </Box>
                         <VStack align="end" spacing={0}>
                            <Text fontSize="xs" fontWeight="900" color={style.color}>{dayName}</Text>
                            <Text fontSize="14px" fontWeight="800" color={useColorModeValue("gray.600", "gray.300")}>{formattedTime}</Text>
                            <Text fontSize="10px" fontWeight="700" color="gray.400">{formattedDate}</Text>
                         </VStack>
                      </Flex>
                      <Divider my={4} opacity={0.3} />
                      <Flex align="center" gap={1}>
                        <Box boxSize={1.5} borderRadius="full" bg="green.400" boxShadow="0 0 8px #48BB78" />
                        <Text fontSize="10px" fontWeight="800" color="gray.500" textTransform="uppercase">Status: Active</Text>
                      </Flex>
                    </Box>
                  </Flex>
                </MotionBox>
              );
            })}
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
});

export default Dashboard;
