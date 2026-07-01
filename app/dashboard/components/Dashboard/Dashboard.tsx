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
import { useEffect, useMemo, useState } from "react";
import stores from "../../../store/stores";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import DarkSkeleton from "../common/DarkSkeleton";
import VideoUploader from "./VideoUpload";

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

const marqueeStyle = `marqueeAnimation 20s linear infinite`;

const Dashboard = observer(() => {
  const {
    dashboardStore: { getDashboardCount, count },
    auth: { user, company }
  } = stores;
  const { t } = useTranslation();

  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const ads = stores.advertisementStore.activeAdvertisements?.data || [];

  useEffect(() => {
    getDashboardCount();
    stores.advertisementStore.getActiveAdvertisements();
  }, [getDashboardCount]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const dashboardData = [
    { label: t("dashboard.doctors"), value: count?.data?.doctors || 0, icon: FaUserMd, color: "blue", href: "/dashboard/doctors", show: stores.auth.hasPermission('doctor', 'view') },
    { label: t("dashboard.patients"), value: count?.data?.patients || 0, icon: FaUserInjured, color: "green", href: "/dashboard/patients", show: stores.auth.hasPermission('patient', 'view') },
    { label: t("dashboard.appointments"), value: count?.data?.appointments || 0, icon: FaCalendarAlt, color: "purple", href: "/dashboard/appointments", show: stores.auth.hasPermission('appointment', 'view') },
    { label: t("dashboard.staff"), value: count?.data?.staffs || 0, icon: FaUserTie, color: "orange", href: "/dashboard/staffs", show: stores.auth.hasPermission('staffs', 'view') },
    { label: t("dashboard.dealers"), value: count?.data?.dealers || 0, icon: FaStore, color: "blue", href: "/dashboard/dealers", show: stores.auth.hasPermission('masters', 'view') },
  ].filter(item => item.show !== false);

  const weeklyGrowthData = useMemo(() => {
    const growth = count?.data?.growth || [];
    return {
      labels: growth.map((g: any) => {
        const date = new Date(g._id);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [{
        label: t("dashboard.newUsers"),
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
          label: t("dashboard.completedAppointments"),
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
    <Box p={{ base: 2, md: 8 }} minH="100vh" bg={useColorModeValue("gray.50", "#0B0E14")} position="relative" overflowX="hidden">
      <style>
        {`
          @keyframes marqueeAnimation {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
      {/* Premium Background Glows */}
      <Box position="absolute" top="-10%" left="-10%" w="500px" h="500px" bg={stores.themeStore.themeConfig.colors.custom.light.primary} filter="blur(150px)" opacity={0.08} borderRadius="full" pointerEvents="none" />
      <Box position="absolute" bottom="0" right="-10%" w="600px" h="600px" bg={stores.themeStore.themeConfig.colors.custom.light.primary} filter="blur(150px)" opacity={0.08} borderRadius="full" pointerEvents="none" />

      <Box mx="auto" position="relative" zIndex={1}>
        <Box mb={4}></Box>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={{ base: 4, md: 6 }} mb={{ base: 8, md: 12 }}>
          {dashboardData.map((item, index) => (
            <DarkSkeleton isLoaded={!count?.loading} key={index}>
              <DashboardCard {...item} />
            </DarkSkeleton>
          ))}
        </SimpleGrid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={{ base: 4, md: 8 }} mb={{ base: 8, md: 10 }}>
          <DarkSkeleton isLoaded={!count?.loading}>
            <Box bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={{ base: 4, md: 8 }} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)">
              <Flex justify="space-between" align="center" mb={{ base: 4, md: 8 }}>
                <Box>
                  <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="900" bgGradient="linear(to-r, blue.400, purple.400)" bgClip="text">{t("dashboard.weeklyGrowth")}</Text>
                  <Text fontSize={{ base: "10px", md: "xs" }} color="gray.500" fontWeight="700">{t("dashboard.revenueVsAppointments")}</Text>
                </Box>
                <Box p={2.5} bg={stores.themeStore.themeConfig.colors.custom.light.primary + "1A"} color={stores.themeStore.themeConfig.colors.custom.light.primary} borderRadius="xl">
                  <Icon as={FaClipboardList} boxSize={5} />
                </Box>
              </Flex>
              <AspectRatio ratio={16 / 9} width="100%">
                <Bar data={weeklyGrowthData} options={barChartOptions} />
              </AspectRatio>
            </Box>
          </DarkSkeleton>

          <DarkSkeleton isLoaded={!count?.loading}>
            <Box bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={{ base: 4, md: 8 }} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)">
              <Flex justify="space-between" align="center" mb={{ base: 4, md: 8 }}>
                <Box>
                  <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="900" bgGradient="linear(to-r, green.400, teal.400)" bgClip="text">{t("dashboard.patientRetention")}</Text>
                  <Text fontSize={{ base: "10px", md: "xs" }} color="gray.500" fontWeight="700">{t("dashboard.performanceTrend")}</Text>
                </Box>
                <Box p={2.5} bg="green.50" color="green.500" borderRadius="xl">
                  <Icon as={FaCalendarAlt} boxSize={5} />
                </Box>
              </Flex>
              <AspectRatio ratio={16 / 9} width="100%">
                <Line data={lineChartData} options={lineChartOptions} />
              </AspectRatio>
            </Box>
          </DarkSkeleton>
        </Grid>
        {/* <VideoUploader /> */}
        <DarkSkeleton isLoaded={!count?.loading}>
          <Box bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={{ base: 4, md: 10 }} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)" position="relative">
            <Box position="absolute" top="-15px" left={{ base: "15px", md: "20px" }} bg={stores.themeStore.themeConfig.colors.custom.light.primary} color="white" px={4} py={1} borderRadius="full" fontSize={{ base: "10px", md: "xs" }} fontWeight="900" boxShadow="lg">{t("dashboard.realTimeMonitor")}</Box>
            <Flex justify="space-between" align="center" mb={{ base: 6, md: 12 }} pt={4}>
              <Box>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" color={stores.themeStore.themeConfig.colors.custom.light.primary} mb={1}>{t("dashboard.liveClinicActivity")}</Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" fontWeight="700">{t("dashboard.detailedOverview")}</Text>
              </Box>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 8 }}>
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
                    p={{ base: 3, md: 6 }}
                    bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor="transparent"
                    _hover={{ borderColor: style.color, transform: 'translateY(-4px)', boxShadow: 'xl', bg: useColorModeValue("white", "whiteAlpha.100") }}
                  >
                    <Flex gap={{ base: 3, md: 5 }} align="center">
                      <Box position="relative">
                        <Avatar size={{ base: "md", md: "lg" }} src={u.pic?.url} name={u.name} borderRadius="2xl" border={{ base: "2px solid", md: "3px solid" }} borderColor={style.color} />
                        <Box position="absolute" bottom="-2px" right="-2px" boxSize={{ base: 5, md: 6 }} bg={style.bg} color={style.color} borderRadius="lg" display="flex" alignItems="center" justifyContent="center" borderWidth="2px" borderColor={useColorModeValue("white", "gray.800")}>
                          <Icon as={style.icon} boxSize={{ base: 2.5, md: 3 }} />
                        </Box>
                      </Box>
                      <Box flex={1} minW={0}>
                        <Flex direction="row" justify="space-between" align="center" gap={2}>
                          <Box minW={0} flex={1}>
                            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="900" color={useColorModeValue("gray.800", "white")} mb={0.5} noOfLines={1}>{u.name}</Text>
                            <Badge variant="subtle" colorScheme={style.color.split('.')[0]} fontSize={{ base: "8px", md: "10px" }} px={2} py={0.5} borderRadius="full" fontWeight="900" textTransform="uppercase" letterSpacing="1px">{u.userType}</Badge>
                          </Box>
                          <VStack align="flex-end" spacing={0}>
                            <Text fontSize={{ base: "10px", md: "xs" }} fontWeight="900" color={style.color}>{dayName}</Text>
                            <Text fontSize={{ base: "12px", md: "14px" }} fontWeight="800" color={useColorModeValue("gray.600", "gray.300")}>{formattedTime}</Text>
                            <Text fontSize={{ base: "9px", md: "10px" }} fontWeight="700" color="gray.400">{formattedDate}</Text>
                          </VStack>
                        </Flex>
                        <Divider my={{ base: 2, md: 4 }} opacity={0.3} />
                        <Flex align="center" gap={1}>
                          <Box boxSize={1.5} borderRadius="full" bg="green.400" boxShadow="0 0 8px #48BB78" />
                          <Text fontSize={{ base: "8px", md: "10px" }} fontWeight="800" color="gray.500" textTransform="uppercase">{t("dashboard.statusActive")}</Text>
                        </Flex>
                      </Box>
                    </Flex>
                  </MotionBox>
                );
              })}
            </SimpleGrid>
          </Box>
        </DarkSkeleton>
      </Box>
    </Box>
  );
});

export default Dashboard;
