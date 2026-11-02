"use client";
import {
  Box,
  Grid,
  Heading,
  SimpleGrid,
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
  Circle,
  Image,
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
  FaArrowRight,
  FaNotesMedical,
  FaChartLine,
  FaChevronRight,
  FaClock,
} from "react-icons/fa";
import DashboardCard from "../common/DashboardCard/DashboardCard";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import stores from "../../../store/stores";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import DarkSkeleton from "../common/DarkSkeleton";

// Chart.js Registration
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

// Chart Options
const barChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: "#1A202C", padding: 12, cornerRadius: 12 },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: "rgba(226, 232, 240, 0.4)", borderDash: [5, 5], drawBorder: false },
      ticks: { font: { size: 10 }, color: "#718096" },
    },
    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#718096" } },
  },
};

const lineChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: "#1A202C", padding: 12, cornerRadius: 12 },
  },
  scales: {
    y: {
      grid: { color: "rgba(226, 232, 240, 0.4)", borderDash: [5, 5] },
      ticks: { font: { size: 10 }, color: "#718096" },
    },
    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#718096" } },
  },
  elements: { line: { tension: 0.4, borderWidth: 3 }, point: { radius: 0, hoverRadius: 6 } },
};

const horizontalBarOptions: any = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: "#1A202C", padding: 12, cornerRadius: 12 },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: "rgba(226, 232, 240, 0.4)", borderDash: [5, 5], drawBorder: false },
      ticks: { font: { size: 10 }, color: "#718096", precision: 0 },
    },
    y: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#718096" } },
  },
};

const HERO_IMAGES = [
  "https://salisburydentist.co.uk/wp-content/uploads/2025/04/woman-patient-dentist-1-scaled.jpg",
  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1080&auto=format&fit=crop",
];

const Dashboard = observer(() => {
  const {
    dashboardStore: { getDashboardCount, count },
    auth: { user },
  } = stores;
  const { t } = useTranslation();

  // State
  const [timeSlotData, setTimeSlotData] = useState<any[]>([]);
  const [activeMobileTab, setActiveMobileTab] = useState<string>("weekly");
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Theme Config
  const isDark = useColorModeValue(false, true);
  const appCardBg = useColorModeValue("white", "rgba(255, 255, 255, 0.04)");
  const appCardBorder = useColorModeValue("gray.100", "whiteAlpha.100");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");

  // Fetch Data
  useEffect(() => {
    getDashboardCount();
    stores.dashboardStore.getTimeSlotAnalytics().then((data) => {
      if (data) setTimeSlotData(data);
    });
    stores.advertisementStore.getActiveAdvertisements();
  }, [getDashboardCount]);

  // Hero Image Auto-Slide Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Permissions & Data Mapping
  const hasPatientPerm = stores.auth.hasPermission("patient", "view");
  const hasAppointmentPerm = stores.auth.hasPermission("appointment", "view");
  const hasStaffPerm = stores.auth.hasPermission("staffs", "view");
  const hasReportsPerm = stores.auth.hasPermission("reports", "view");

  const showWeeklyGrowth = hasPatientPerm || hasReportsPerm;
  const showTimeSlot = hasAppointmentPerm;
  const showLiveActivity = hasStaffPerm || hasPatientPerm;

  const dashboardData = [
    { label: t("dashboard.doctors"), value: count?.data?.doctors || 0, icon: FaUserMd, color: "blue", href: "/dashboard/doctors", show: stores.auth.hasPermission("doctor", "view") },
    { label: t("dashboard.patients"), value: count?.data?.patients || 0, icon: FaUserInjured, color: "teal", href: "/dashboard/patients", show: stores.auth.hasPermission("patient", "view") && !["staff", "doctor"].includes(user?.userType?.toLowerCase()) },
    { label: t("dashboard.appointments"), value: count?.data?.appointments || 0, icon: FaCalendarAlt, color: "purple", href: "/dashboard/appointments", show: stores.auth.hasPermission("appointment", "view") && !["staff", "doctor"].includes(user?.userType?.toLowerCase()) },
    { label: t("dashboard.staff"), value: count?.data?.staffs || 0, icon: FaUserTie, color: "orange", href: "/dashboard/staffs", show: stores.auth.hasPermission("staffs", "view") },
    { label: t("dashboard.dealers"), value: count?.data?.dealers || 0, icon: FaStore, color: "pink", href: "/dashboard/dealers", show: stores.auth.hasPermission("masters", "view") },
  ].filter((item) => item.show !== false);

  // Chart Data Memos
  const weeklyGrowthData = useMemo(() => {
    const growth = count?.data?.growth || [];
    return {
      labels: growth.map((g: any) => new Date(g._id).toLocaleDateString("en-US", { weekday: "short" })),
      datasets: [{ label: t("dashboard.newUsers"), data: growth.map((g: any) => g.count), backgroundColor: stores.themeStore.themeConfig.colors.custom.light.primary + "CC", borderRadius: 6, barThickness: 18 }],
    };
  }, [count?.data?.growth, t]);

  const treatmentTrendsData = useMemo(() => {
    const trends = count?.data?.treatmentTrends || [];
    return {
      labels: trends.map((t: any) => t.label),
      datasets: [{ label: "Treatments", data: trends.map((t: any) => t.count), backgroundColor: "rgba(56, 161, 105, 0.75)", borderRadius: 4, barThickness: 14 }],
    };
  }, [count?.data?.treatmentTrends]);

  const appointmentTrendsData = useMemo(() => {
    const trends = count?.data?.appointmentTrends || [];
    return {
      labels: trends.map((t: any) => t._id),
      datasets: [{ label: "Appointments", data: trends.map((t: any) => t.count), borderColor: "#ed8936", backgroundColor: "rgba(237, 137, 54, 0.15)", fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: "#ed8936" }],
    };
  }, [count?.data?.appointmentTrends]);

  const timeSlotChartData = useMemo(() => {
    return {
      labels: timeSlotData.map((t: any) => t.slot),
      datasets: [
        { label: "Appointments", data: timeSlotData.map((t: any) => t.appointmentsCount), borderColor: "#3182ce", backgroundColor: "rgba(49, 130, 206, 0.15)", fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: "#3182ce" },
        { label: "Patients", data: timeSlotData.map((t: any) => t.patientsCount), borderColor: "#38a169", backgroundColor: "rgba(56, 161, 105, 0.15)", fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: "#38a169" },
        { label: "Doctors", data: timeSlotData.map((t: any) => t.doctorsCount), borderColor: "#805ad5", backgroundColor: "rgba(128, 90, 213, 0.15)", fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: "#805ad5" },
      ],
    };
  }, [timeSlotData]);

  return (
    <Box p={{ base: 0, md: 8 }} minH="100vh" bg={useColorModeValue("gray.50", "#0B0E14")} position="relative" overflowX="hidden">
      <Box mx="auto" position="relative" zIndex={1}>
        {/* ========================================================= */}
        {/* ==================== MOBILE VIEW ======================== */}
        {/* ========================================================= */}
        <Box display={{ base: "block", md: "none" }} pb={10}>
          
          {/* 1. Auto-Sliding Image Carousel (No Text) */}
          <Box px={4} pt={4} mb={4}>
            <Box
              borderRadius="2xl"
              overflow="hidden"
              position="relative"
              boxShadow="md"
              h="160px"
              bg="gray.200"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHeroSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Image
                    src={HERO_IMAGES[currentHeroSlide]}
                    alt={`Slide ${currentHeroSlide + 1}`}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    objectPosition="center"
                  />
                </motion.div>
              </AnimatePresence>
            </Box>
            
            {/* Slide Indicators (Dots) */}
            <HStack justify="center" spacing={1.5} mt={3}>
              {HERO_IMAGES.map((_, idx) => (
                <Box
                  key={idx}
                  w={currentHeroSlide === idx ? "16px" : "6px"}
                  h="6px"
                  borderRadius="full"
                  bg={currentHeroSlide === idx ? "blue.500" : "gray.300"}
                  transition="all 0.3s ease"
                />
              ))}
            </HStack>
          </Box>

          {/* 2. Horizontal Scrolling Stat Cards */}
          <Box mb={6}>
            <Flex justify="space-between" align="center" px={4} mb={3}>
              <Text fontSize="xs" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                Key Metrics
              </Text>
              <Text fontSize="11px" fontWeight="700" color="blue.400">Swipe →</Text>
            </Flex>

            <Flex
              overflowX="auto"
              px={4}
              py={1}
              gap={3.5}
              css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}
            >
              {dashboardData.map((item, index) => (
                <MotionBox
                  key={index}
                  minW="145px"
                  bg={appCardBg}
                  p={4}
                  borderRadius="2xl"
                  boxShadow="0 4px 15px rgba(0,0,0,0.03)"
                  borderWidth="1px"
                  borderColor={appCardBorder}
                  backdropFilter="blur(10px)"
                  onClick={() => (window.location.href = item.href)}
                  whileTap={{ scale: 0.95 }}
                  flexShrink={0}
                >
                  <Flex justify="space-between" align="center" mb={3}>
                    <Circle size="36px" bg={`${item.color}.500`} color="white" boxShadow={`0 4px 10px ${item.color}40`}>
                      <Icon as={item.icon} boxSize={4} />
                    </Circle>
                    <Icon as={FaChevronRight} boxSize={2.5} color="gray.400" />
                  </Flex>
                  <Text fontSize="2xl" fontWeight="900" color={textColor} lineHeight="1" mb={1}>
                    {item.value}
                  </Text>
                  <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wide" noOfLines={1}>
                    {item.label}
                  </Text>
                </MotionBox>
              ))}
            </Flex>
          </Box>

          {/* 3. Interactive Analytics Segment */}
          <Box px={4} mb={6}>
            <Text fontSize="xs" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={3}>
              Analytics Hub
            </Text>

            {/* Segment Tabs */}
            <Flex bg={isDark ? "gray.800" : "gray.200"} p={1} borderRadius="2xl" mb={4} gap={1} overflowX="auto" css={{ "&::-webkit-scrollbar": { display: "none" } }}>
              {showWeeklyGrowth && (
                <Flex flex={1} py={2} px={3} justify="center" align="center" borderRadius="xl" cursor="pointer" bg={activeMobileTab === "weekly" ? (isDark ? "gray.700" : "white") : "transparent"} boxShadow={activeMobileTab === "weekly" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"} onClick={() => setActiveMobileTab("weekly")} transition="all 0.2s">
                  <Text fontSize="11px" fontWeight="800" color={activeMobileTab === "weekly" ? "blue.400" : "gray.500"}>Weekly</Text>
                </Flex>
              )}
              {showTimeSlot && (
                <Flex flex={1} py={2} px={3} justify="center" align="center" borderRadius="xl" cursor="pointer" bg={activeMobileTab === "slots" ? (isDark ? "gray.700" : "white") : "transparent"} boxShadow={activeMobileTab === "slots" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"} onClick={() => setActiveMobileTab("slots")} transition="all 0.2s">
                  <Text fontSize="11px" fontWeight="800" color={activeMobileTab === "slots" ? "green.400" : "gray.500"}>Slots</Text>
                </Flex>
              )}
              {showWeeklyGrowth && (
                <Flex flex={1} py={2} px={3} justify="center" align="center" borderRadius="xl" cursor="pointer" bg={activeMobileTab === "treatments" ? (isDark ? "gray.700" : "white") : "transparent"} boxShadow={activeMobileTab === "treatments" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"} onClick={() => setActiveMobileTab("treatments")} transition="all 0.2s">
                  <Text fontSize="11px" fontWeight="800" color={activeMobileTab === "treatments" ? "purple.400" : "gray.500"}>Treatments</Text>
                </Flex>
              )}
              {showTimeSlot && (
                <Flex flex={1} py={2} px={3} justify="center" align="center" borderRadius="xl" cursor="pointer" bg={activeMobileTab === "trends" ? (isDark ? "gray.700" : "white") : "transparent"} boxShadow={activeMobileTab === "trends" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"} onClick={() => setActiveMobileTab("trends")} transition="all 0.2s">
                  <Text fontSize="11px" fontWeight="800" color={activeMobileTab === "trends" ? "orange.400" : "gray.500"}>Trends</Text>
                </Flex>
              )}
            </Flex>

            {/* Active Chart */}
            <AnimatePresence mode="wait">
              <MotionBox key={activeMobileTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} bg={appCardBg} p={4} borderRadius="3xl" boxShadow="0 4px 20px rgba(0,0,0,0.04)" borderWidth="1px" borderColor={appCardBorder}>
                {activeMobileTab === "weekly" && showWeeklyGrowth && (
                  <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Box>
                        <Text fontSize="md" fontWeight="900" color={textColor}>{t("dashboard.weeklyGrowth")}</Text>
                        <Text fontSize="10px" color={subTextColor} fontWeight="600">{t("dashboard.revenueVsAppointments")}</Text>
                      </Box>
                      <Circle size="32px" bg="blue.500" color="white"><Icon as={FaClipboardList} boxSize={3.5} /></Circle>
                    </Flex>
                    <Box h="230px" w="100%"><Bar data={weeklyGrowthData} options={barChartOptions} /></Box>
                  </Box>
                )}

                {activeMobileTab === "slots" && showTimeSlot && (
                  <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Box>
                        <Text fontSize="md" fontWeight="900" color={textColor}>{t("dashboard.timeSlotAnalytics")}</Text>
                        <Text fontSize="10px" color={subTextColor} fontWeight="600">{t("dashboard.dailyAppointmentDistribution")}</Text>
                      </Box>
                      <Circle size="32px" bg="green.500" color="white"><Icon as={FaCalendarAlt} boxSize={3.5} /></Circle>
                    </Flex>
                    <Box h="230px" w="100%">
                      <Line data={timeSlotChartData} options={{ ...lineChartOptions, plugins: { ...lineChartOptions.plugins, legend: { display: true, position: "top", labels: { boxWidth: 8, usePointStyle: true, font: { size: 9 } } } } }} />
                    </Box>
                  </Box>
                )}

                {activeMobileTab === "treatments" && showWeeklyGrowth && (
                  <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Box>
                        <Text fontSize="md" fontWeight="900" color={textColor}>{t("dashboard.treatmentTrends")}</Text>
                        <Text fontSize="10px" color={subTextColor} fontWeight="600">{t("dashboard.top10Treatments")}</Text>
                      </Box>
                      <Circle size="32px" bg="purple.500" color="white"><Icon as={FaNotesMedical} boxSize={3.5} /></Circle>
                    </Flex>
                    <Box h="260px" w="100%"><Bar data={treatmentTrendsData} options={horizontalBarOptions} /></Box>
                  </Box>
                )}

                {activeMobileTab === "trends" && showTimeSlot && (
                  <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Box>
                        <Text fontSize="md" fontWeight="900" color={textColor}>{t("dashboard.appointmentTrends")}</Text>
                        <Text fontSize="10px" color={subTextColor} fontWeight="600">{t("dashboard.sixMonthsGrowthHistory")}</Text>
                      </Box>
                      <Circle size="32px" bg="orange.500" color="white"><Icon as={FaChartLine} boxSize={3.5} /></Circle>
                    </Flex>
                    <Box h="230px" w="100%"><Line data={appointmentTrendsData} options={lineChartOptions} /></Box>
                  </Box>
                )}
              </MotionBox>
            </AnimatePresence>
          </Box>

          {/* 4. Timeline Activity Feed */}
          {showLiveActivity && (
            <Box px={4} mb={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <HStack spacing={2}>
                  <Circle size="24px" bg="green.500" color="white"><Icon as={FaClock} boxSize={3} /></Circle>
                  <Text fontSize="md" fontWeight="900" color={textColor}>{t("dashboard.liveClinicActivity")}</Text>
                </HStack>
                <Badge colorScheme="green" variant="solid" rounded="full" px={2.5} py={0.5} fontSize="9px" fontWeight="800">LIVE</Badge>
              </Flex>

              <VStack spacing={3} align="stretch">
                {count?.data?.recentUsers?.map((u: any, idx: number) => {
                  const regDate = new Date(u.createdAt);
                  const formattedTime = regDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  const formattedDate = regDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

                  const typeColors: any = {
                    doctor: { bg: "blue.500", color: "blue.400", badge: "blue" },
                    patient: { bg: "green.500", color: "green.400", badge: "green" },
                    staff: { bg: "purple.500", color: "purple.400", badge: "purple" },
                    dealer: { bg: "orange.500", color: "orange.400", badge: "orange" },
                  };
                  const style = typeColors[u.userType?.toLowerCase()] || { bg: "gray.500", color: "gray.400", badge: "gray" };

                  return (
                    <MotionBox key={idx} bg={appCardBg} p={3.5} borderRadius="2xl" boxShadow="0 2px 10px rgba(0,0,0,0.02)" borderWidth="1px" borderColor={appCardBorder} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                      <Flex align="center" gap={3}>
                        <Avatar size="md" src={u.pic?.url} name={u.name} borderRadius="xl" />
                        <Box flex={1} minW={0}>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="sm" fontWeight="800" color={textColor} noOfLines={1}>{u.name}</Text>
                            <HStack spacing={1} color="gray.400">
                              <Icon as={FaClock} boxSize={2.5} />
                              <Text fontSize="10px" fontWeight="700">{formattedTime}</Text>
                            </HStack>
                          </Flex>
                          <Flex justify="space-between" align="center" mt={1}>
                            <Badge colorScheme={style.badge} variant="subtle" fontSize="9px" px={2} py={0.5} borderRadius="md" fontWeight="800">{u.userType}</Badge>
                            <Text fontSize="10px" fontWeight="600" color="gray.400">{formattedDate}</Text>
                          </Flex>
                        </Box>
                      </Flex>
                    </MotionBox>
                  );
                })}
              </VStack>
            </Box>
          )}
        </Box>

        {/* ========================================================= */}
        {/* ==================== DESKTOP VIEW ======================= */}
        {/* ========================================================= */}
        <Box display={{ base: "none", md: "block" }}>
          <Box mb={4}></Box>
          <SimpleGrid columns={{ md: 2, lg: 5 }} spacing={6} mb={12}>
            {dashboardData.map((item, index) => (
              <DarkSkeleton isLoaded={!count?.loading} key={index}>
                <DashboardCard {...item} />
              </DarkSkeleton>
            ))}
          </SimpleGrid>

          <Grid templateColumns={{ lg: "1fr 1fr" }} gap={8} mb={10}>
            {showWeeklyGrowth && (
              <DarkSkeleton isLoaded={!count?.loading}>
                <Box bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={8} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)">
                  <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                      <Text fontSize="xl" fontWeight="900" bgGradient="linear(to-r, blue.400, purple.400)" bgClip="text">{t("dashboard.weeklyGrowth")}</Text>
                      <Text fontSize="xs" color="gray.500" fontWeight="700">{t("dashboard.revenueVsAppointments")}</Text>
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
            )}

            {showTimeSlot && (
              <DarkSkeleton isLoaded={!count?.loading}>
                <Box bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={8} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)">
                  <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                      <Text fontSize="xl" fontWeight="900" bgGradient="linear(to-r, green.400, teal.400)" bgClip="text">{t("dashboard.timeSlotAnalytics")}</Text>
                      <Text fontSize="xs" color="gray.500" fontWeight="700">{t("dashboard.dailyAppointmentDistribution")}</Text>
                    </Box>
                    <Box p={2.5} bg="green.50" color="green.500" borderRadius="xl">
                      <Icon as={FaCalendarAlt} boxSize={5} />
                    </Box>
                  </Flex>
                  <AspectRatio ratio={16 / 9} width="100%">
                    <Line
                      data={timeSlotChartData}
                      options={{
                        ...lineChartOptions,
                        plugins: {
                          ...lineChartOptions.plugins,
                          legend: { display: true, position: "top", labels: { boxWidth: 12, usePointStyle: true, font: { size: 10 } } },
                          tooltip: {
                            ...lineChartOptions.plugins?.tooltip,
                            callbacks: {
                              afterBody: (tooltipItems: any) => {
                                const index = tooltipItems[0].dataIndex;
                                const exactTimes = timeSlotData[index]?.exactTimes;
                                return exactTimes?.length ? `\nExact Times:\n${exactTimes.join(", ")}` : "";
                              },
                            },
                          },
                        },
                      }}
                    />
                  </AspectRatio>
                </Box>
              </DarkSkeleton>
            )}

            {showWeeklyGrowth && (
              <DarkSkeleton isLoaded={!count?.loading}>
                <Box minW={0} bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={8} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)">
                  <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                      <Text fontSize="xl" fontWeight="900" bgGradient="linear(to-r, purple.400, pink.400)" bgClip="text">{t("dashboard.treatmentTrends")}</Text>
                      <Text fontSize="xs" color="gray.500" fontWeight="700">{t("dashboard.top10Treatments")}</Text>
                    </Box>
                    <Box p={2.5} bg="purple.50" color="purple.500" borderRadius="xl">
                      <Icon as={FaNotesMedical} boxSize={5} />
                    </Box>
                  </Flex>
                  <Box position="relative" height="400px" width="100%">
                    <Bar data={treatmentTrendsData} options={horizontalBarOptions} />
                  </Box>
                </Box>
              </DarkSkeleton>
            )}

            {showTimeSlot && (
              <DarkSkeleton isLoaded={!count?.loading}>
                <Box minW={0} bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={8} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)">
                  <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                      <Text fontSize="xl" fontWeight="900" bgGradient="linear(to-r, orange.400, red.400)" bgClip="text">{t("dashboard.appointmentTrends")}</Text>
                      <Text fontSize="xs" color="gray.500" fontWeight="700">{t("dashboard.sixMonthsGrowthHistory")}</Text>
                    </Box>
                    <Box p={2.5} bg="orange.50" color="orange.500" borderRadius="xl">
                      <Icon as={FaChartLine} boxSize={5} />
                    </Box>
                  </Flex>
                  <Box position="relative" height="400px" width="100%">
                    <Line data={appointmentTrendsData} options={lineChartOptions} />
                  </Box>
                </Box>
              </DarkSkeleton>
            )}
          </Grid>

          {showLiveActivity && (
            <DarkSkeleton isLoaded={!count?.loading}>
              <Box bg={useColorModeValue("white", "rgba(255, 255, 255, 0.03)")} p={10} borderRadius="3xl" boxShadow="sm" borderWidth="1px" borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} backdropFilter="blur(20px)" position="relative">
                <Box position="absolute" top="-15px" left="20px" bg={stores.themeStore.themeConfig.colors.custom.light.primary} color="white" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="900" boxShadow="lg">{t("dashboard.realTimeMonitor")}</Box>
                <Flex justify="space-between" align="center" mb={12} pt={4}>
                  <Box>
                    <Text fontSize="2xl" fontWeight="900" color={stores.themeStore.themeConfig.colors.custom.light.primary} mb={1}>{t("dashboard.liveClinicActivity")}</Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="700">{t("dashboard.detailedOverview")}</Text>
                  </Box>
                </Flex>

                <SimpleGrid columns={2} spacing={8}>
                  {count?.data?.recentUsers?.map((u: any, idx: number) => {
                    const regDate = new Date(u.createdAt);
                    const formattedDate = regDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                    const formattedTime = regDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                    const dayName = regDate.toLocaleDateString("en-GB", { weekday: "long" });

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
                        transition={{ duration: 0.3, ease: "easeInOut", delay: idx * 0.1 }}
                        p={6}
                        bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                        borderRadius="2xl"
                        borderWidth="1px"
                        borderColor="transparent"
                        _hover={{ borderColor: style.color, transform: "translateY(-4px)", boxShadow: "xl", bg: useColorModeValue("white", "whiteAlpha.100") }}
                      >
                        <Flex gap={5} align="center">
                          <Box position="relative">
                            <Avatar size="lg" src={u.pic?.url} name={u.name} borderRadius="2xl" border="3px solid" borderColor={style.color} />
                            <Box position="absolute" bottom="-2px" right="-2px" boxSize={6} bg={style.bg} color={style.color} borderRadius="lg" display="flex" alignItems="center" justifyContent="center" borderWidth="2px" borderColor={useColorModeValue("white", "gray.800")}>
                              <Icon as={style.icon} boxSize={3} />
                            </Box>
                          </Box>
                          <Box flex={1} minW={0}>
                            <Flex direction="row" justify="space-between" align="center" gap={2}>
                              <Box minW={0} flex={1}>
                                <Text fontSize="lg" fontWeight="900" color={useColorModeValue("gray.800", "white")} mb={0.5} noOfLines={1}>{u.name}</Text>
                                <Badge variant="subtle" colorScheme={style.color.split(".")[0]} fontSize="10px" px={2} py={0.5} borderRadius="full" fontWeight="900" textTransform="uppercase" letterSpacing="1px">{u.userType}</Badge>
                              </Box>
                              <VStack align="flex-end" spacing={0}>
                                <Text fontSize="xs" fontWeight="900" color={style.color}>{dayName}</Text>
                                <Text fontSize="14px" fontWeight="800" color={useColorModeValue("gray.600", "gray.300")}>{formattedTime}</Text>
                                <Text fontSize="10px" fontWeight="700" color="gray.400">{formattedDate}</Text>
                              </VStack>
                            </Flex>
                            <Divider my={4} opacity={0.3} />
                            <Flex align="center" gap={1}>
                              <Box boxSize={1.5} borderRadius="full" bg="green.400" boxShadow="0 0 8px #48BB78" />
                              <Text fontSize="10px" fontWeight="800" color="gray.500" textTransform="uppercase">{t("dashboard.statusActive")}</Text>
                            </Flex>
                          </Box>
                        </Flex>
                      </MotionBox>
                    );
                  })}
                </SimpleGrid>
              </Box>
            </DarkSkeleton>
          )}
        </Box>
      </Box>
    </Box>
  );
});

export default Dashboard;