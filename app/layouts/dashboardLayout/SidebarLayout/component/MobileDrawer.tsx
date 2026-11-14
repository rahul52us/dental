'use client';

import React, { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiX,
  FiChevronRight,
  FiLogOut,
  FiSearch,
  FiLayers,
  FiCheckCircle,
} from 'react-icons/fi';
import { FaCircle } from 'react-icons/fa';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import stores from '../../../../store/stores';
import { SidebarItem } from '../SidebarLayout';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  activeItemId: number | null;
  expandedPath: number[];
  onClick: (item: any) => void;
  onLeafClick: (item: SidebarItem) => void;
}

interface BadgeStyleConfig {
  bg: string;
  gradient: string;
  color: string;
  shadow: string;
  darkBg: string;
  darkColor: string;
  sublabel: string;
}

const ITEM_BADGE_STYLES: Record<string, BadgeStyleConfig> = {
  Users: {
    bg: '#EFF6FF',
    gradient: 'linear(to-br, #DBEAFE, #BFDBFE)',
    color: '#1D4ED8',
    shadow: 'rgba(29, 78, 216, 0.16)',
    darkBg: 'rgba(59, 130, 246, 0.2)',
    darkColor: '#93C5FD',
    sublabel: 'Team & Staff Directory',
  },
  Lab: {
    bg: '#FFF1F2',
    gradient: 'linear(to-br, #FFE4E6, #FECDD3)',
    color: '#E11D48',
    shadow: 'rgba(225, 29, 72, 0.16)',
    darkBg: 'rgba(244, 63, 94, 0.2)',
    darkColor: '#FDA4AF',
    sublabel: 'Lab Work & Case Tracker',
  },
  'Doctor Inventory': {
    bg: '#FDF2F8',
    gradient: 'linear(to-br, #FCE7F3, #FBCFE8)',
    color: '#BE185D',
    shadow: 'rgba(190, 24, 93, 0.16)',
    darkBg: 'rgba(236, 72, 153, 0.2)',
    darkColor: '#F472B6',
    sublabel: 'Supplies & Instruments',
  },
  'In & Out Ledger': {
    bg: '#ECFDF5',
    gradient: 'linear(to-br, #D1FAE5, #A7F3D0)',
    color: '#059669',
    shadow: 'rgba(5, 150, 105, 0.16)',
    darkBg: 'rgba(16, 185, 129, 0.2)',
    darkColor: '#6EE7B7',
    sublabel: 'Cash Flow & Accounts',
  },
  'Recall Appointment': {
    bg: '#F0FDFA',
    gradient: 'linear(to-br, #CCFBF1, #99F6E4)',
    color: '#0D9488',
    shadow: 'rgba(13, 148, 136, 0.16)',
    darkBg: 'rgba(20, 184, 166, 0.2)',
    darkColor: '#5EEAD4',
    sublabel: 'Patient Recall & Routine',
  },
  Appointments: {
    bg: '#FAF5FF',
    gradient: 'linear(to-br, #F3E8FF, #E9D5FF)',
    color: '#7E22CE',
    shadow: 'rgba(126, 34, 206, 0.16)',
    darkBg: 'rgba(168, 85, 247, 0.2)',
    darkColor: '#C084FC',
    sublabel: 'Calendar & Schedules',
  },
  Masters: {
    bg: '#F0F9FF',
    gradient: 'linear(to-br, #E0F2FE, #BAE6FD)',
    color: '#0284C7',
    shadow: 'rgba(2, 132, 199, 0.16)',
    darkBg: 'rgba(14, 165, 233, 0.2)',
    darkColor: '#7DD3FC',
    sublabel: 'System & Clinic Masters',
  },
  Chairs: {
    bg: '#F5F3FF',
    gradient: 'linear(to-br, #EDE9FE, #DDD6FE)',
    color: '#6D28D9',
    shadow: 'rgba(109, 40, 217, 0.16)',
    darkBg: 'rgba(139, 92, 246, 0.2)',
    darkColor: '#A78BFA',
    sublabel: 'Dental Operatories',
  },
  Reports: {
    bg: '#F0FDF4',
    gradient: 'linear(to-br, #DCFCE7, #BBF7D0)',
    color: '#15803D',
    shadow: 'rgba(21, 128, 61, 0.16)',
    darkBg: 'rgba(34, 197, 94, 0.2)',
    darkColor: '#86EFAC',
    sublabel: 'Analytics & Practice Audit',
  },
  'Global Accountability': {
    bg: '#FFF7ED',
    gradient: 'linear(to-br, #FFEDD5, #FED7AA)',
    color: '#C2410C',
    shadow: 'rgba(194, 65, 12, 0.16)',
    darkBg: 'rgba(249, 115, 22, 0.2)',
    darkColor: '#FDBA74',
    sublabel: 'Audit & Multi-Branch Flow',
  },
  Settings: {
    bg: '#F8FAFC',
    gradient: 'linear(to-br, #F1F5F9, #E2E8F0)',
    color: '#475569',
    shadow: 'rgba(71, 85, 105, 0.16)',
    darkBg: 'rgba(148, 163, 184, 0.2)',
    darkColor: '#CBD5E1',
    sublabel: 'Application Settings',
  },
  Admins: {
    bg: '#EFF6FF',
    gradient: 'linear(to-br, #DBEAFE, #BFDBFE)',
    color: '#1E40AF',
    shadow: 'rgba(30, 64, 175, 0.16)',
    darkBg: 'rgba(59, 130, 246, 0.2)',
    darkColor: '#93C5FD',
    sublabel: 'Admin Privileges',
  },
  Advertisements: {
    bg: '#FFFBEB',
    gradient: 'linear(to-br, #FEF3C7, #FDE68A)',
    color: '#B45309',
    shadow: 'rgba(180, 83, 9, 0.16)',
    darkBg: 'rgba(245, 158, 11, 0.2)',
    darkColor: '#FCD34D',
    sublabel: 'Promotions & Banners',
  },
  'Marketing Campaigns': {
    bg: '#FDF2F8',
    gradient: 'linear(to-br, #FCE7F3, #FBCFE8)',
    color: '#BE185D',
    shadow: 'rgba(190, 24, 93, 0.16)',
    darkBg: 'rgba(236, 72, 153, 0.2)',
    darkColor: '#F472B6',
    sublabel: 'SMS & Patient Outreach',
  },
  'Global Settings': {
    bg: '#F1F5F9',
    gradient: 'linear(to-br, #E2E8F0, #CBD5E1)',
    color: '#334155',
    shadow: 'rgba(51, 65, 85, 0.16)',
    darkBg: 'rgba(148, 163, 184, 0.2)',
    darkColor: '#CBD5E1',
    sublabel: 'Tenant Master Controls',
  },
};

const renderDrawerIcon = (icon: any, boxSize: string = '19px') => {
  if (!icon) return <Icon as={FaCircle as any} boxSize={boxSize} />;
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon as React.ReactElement<any>, {
      style: { width: boxSize, height: boxSize },
      size: parseInt(boxSize, 10) || 19,
      color: 'currentColor',
    });
  }
  if (icon?.type) {
    return <Icon as={icon.type} boxSize={boxSize} color="currentColor" />;
  }
  return <Icon as={FaCircle as any} boxSize={boxSize} />;
};

const MobileDrawer: React.FC<MobileDrawerProps> = observer(
  ({
    isOpen,
    onClose,
    items,
    activeItemId,
    expandedPath,
    onClick,
    onLeafClick,
  }) => {
    const {
      auth: { user, doLogout },
      themeStore: { themeConfig },
    } = stores;
    const { colorMode } = useColorMode();
    const { t } = useTranslation();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');

    const cardBg = useColorModeValue('#FFFFFF', '#1E293B');
    const cardBorder = useColorModeValue('rgba(226, 232, 240, 0.85)', 'rgba(51, 65, 85, 0.6)');
    const cardBorderHover = useColorModeValue('teal.300', 'teal.500');
    const activeBorder = useColorModeValue('teal.500', 'teal.400');
    const activeBg = useColorModeValue(
      'linear-gradient(135deg, rgba(204, 251, 241, 0.45) 0%, rgba(240, 253, 250, 0.8) 100%)',
      'rgba(20, 184, 166, 0.14)'
    );
    const textColor = useColorModeValue('#0F172A', '#F8FAFC');
    const subtextColor = useColorModeValue('#64748B', '#94A3B8');
    const drawerBg = useColorModeValue('#F8FAFC', '#0F172A');
    const searchBg = useColorModeValue('#FFFFFF', '#1E293B');
    const searchBorder = useColorModeValue('gray.200', 'gray.700');

    const defaultExpandedIndex =
      expandedPath.length > 0 ? [expandedPath[0]] : [];

    const isItemActive = (item: SidebarItem): boolean => {
      if (item.id === activeItemId) return true;
      if (item.children) {
        return item.children.some(isItemActive);
      }
      return false;
    };

    const getItemBadgeStyle = (item: SidebarItem): BadgeStyleConfig => {
      const predefined = ITEM_BADGE_STYLES[item.name];
      if (predefined) {
        return {
          ...predefined,
          bg: colorMode === 'dark' ? predefined.darkBg : predefined.bg,
          color: colorMode === 'dark' ? predefined.darkColor : predefined.color,
        };
      }

      const customColor = themeConfig.sidebarColors?.[item.name];
      if (customColor) {
        const baseColor =
          colorMode === 'dark' ? customColor.dark : customColor.light;
        return {
          bg: `${baseColor}1F`,
          gradient: `linear(to-br, ${baseColor}22, ${baseColor}11)`,
          color: baseColor,
          shadow: `${baseColor}26`,
          darkBg: `${baseColor}22`,
          darkColor: baseColor,
          sublabel: 'Practice Module',
        };
      }

      return {
        bg: colorMode === 'dark' ? 'whiteAlpha.150' : '#F0FDFA',
        gradient: 'linear(to-br, #CCFBF1, #E0F2FE)',
        color: colorMode === 'dark' ? '#5EEAD4' : '#0D9488',
        shadow: 'rgba(13, 148, 136, 0.15)',
        darkBg: 'rgba(20, 184, 166, 0.15)',
        darkColor: '#5EEAD4',
        sublabel: 'Practice Module',
      };
    };

    // Filter items if user uses the quick navigation search
    const filteredItems = useMemo(() => {
      if (!searchQuery.trim()) return items;
      const q = searchQuery.toLowerCase().trim();
      return items.filter((item) => {
        const matchParent = item.name.toLowerCase().includes(q);
        const matchChild = item.children?.some((c) =>
          c.name.toLowerCase().includes(q)
        );
        return matchParent || matchChild;
      });
    }, [items, searchQuery]);

    const companyName =
      user?.companyDetails?.company_name || 'DentalCare Clinic';

    return (
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <DrawerContent
          w={{ base: '100vw', sm: '375px' }}
          maxW={{ base: '100vw', sm: '375px' }}
          h="100dvh"
          maxH="100dvh"
          borderRadius={0}
          overflow="hidden"
          bg={drawerBg}
          boxShadow="-12px 0 35px rgba(0, 0, 0, 0.28)"
          display="flex"
          flexDirection="column"
        >
          {/* Executive Dental Header */}
          <Box
            bgGradient="linear(135deg, #091E42 0%, #0C4A6E 52%, #0D9488 100%)"
            px={4}
            pt={5}
            pb={4}
            position="relative"
            overflow="hidden"
            boxShadow="0 4px 20px rgba(13, 148, 136, 0.2)"
          >
            {/* Ambient Background Glow Circles */}
            <Box
              position="absolute"
              top="-25px"
              right="-25px"
              w="110px"
              h="110px"
              bg="whiteAlpha.100"
              borderRadius="full"
              filter="blur(22px)"
              pointerEvents="none"
            />
            <Box
              position="absolute"
              bottom="-20px"
              left="10px"
              w="90px"
              h="90px"
              bg="cyan.400"
              opacity={0.16}
              borderRadius="full"
              filter="blur(20px)"
              pointerEvents="none"
            />

            {/* Top Brand Identity Bar */}
            <Flex align="center" justify="space-between" position="relative" zIndex={1}>
              <Flex
                align="center"
                gap={3}
                cursor="pointer"
                flex={1}
                minW={0}
                onClick={() => {
                  router.push('/dashboard');
                  onClose();
                }}
              >
                <Box
                  p="2px"
                  borderRadius="15px"
                  bg="whiteAlpha.350"
                  boxShadow="0 4px 14px rgba(0,0,0,0.2)"
                  backdropFilter="blur(8px)"
                >
                  <Avatar
                    size="md"
                    src={
                      user?.companyDetails?.logo?.url || '/images/whiteLogo.png'
                    }
                    name={companyName}
                    borderRadius="13px"
                    bg="white"
                    color="teal.800"
                    boxShadow="inset 0 0 0 1px rgba(0,0,0,0.06)"
                  />
                </Box>

                <Box flex={1} minW={0}>
                  <Text
                    fontWeight="800"
                    fontSize="15px"
                    color="white"
                    noOfLines={1}
                    letterSpacing="-0.3px"
                  >
                    {companyName}
                  </Text>
                  <HStack spacing={1.5} mt={0.5}>
                    <Box
                      w="7px"
                      h="7px"
                      borderRadius="full"
                      bg="#22C55E"
                      boxShadow="0 0 8px #22C55E"
                    />
                    <Text
                      fontSize="11.5px"
                      color="whiteAlpha.900"
                      fontWeight="600"
                      noOfLines={1}
                    >
                      {user?.name || 'Practitioner'}
                    </Text>
                    {user?.userType && (
                      <Badge
                        bg="whiteAlpha.250"
                        color="white"
                        fontSize="9px"
                        fontWeight="750"
                        borderRadius="full"
                        px={1.8}
                        py={0.2}
                        textTransform="uppercase"
                        letterSpacing="0.4px"
                        backdropFilter="blur(4px)"
                      >
                        {user.userType}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              </Flex>

              <IconButton
                aria-label="Close navigation"
                icon={<FiX size={17} strokeWidth={2.6} />}
                size="sm"
                color="white"
                bg="whiteAlpha.200"
                _hover={{ bg: 'whiteAlpha.350', transform: 'scale(1.08)' }}
                _active={{ bg: 'whiteAlpha.450', transform: 'scale(0.94)' }}
                borderRadius="full"
                onClick={onClose}
                backdropFilter="blur(4px)"
                ml={2}
              />
            </Flex>

            {/* Navigation Header Sub-bar */}
            <Flex
              align="center"
              justify="space-between"
              mt={3.5}
              pt={2.5}
              borderTop="1px solid"
              borderColor="whiteAlpha.200"
              position="relative"
              zIndex={1}
            >
              <HStack spacing={1.5}>
                <Icon as={FiLayers} color="cyan.200" boxSize="12px" />
                <Text
                  fontSize="10px"
                  fontWeight="800"
                  color="whiteAlpha.900"
                  letterSpacing="0.9px"
                  textTransform="uppercase"
                >
                  Navigation Hub
                </Text>
              </HStack>

              <Badge
                bg="whiteAlpha.200"
                color="white"
                fontSize="10px"
                fontWeight="700"
                borderRadius="full"
                px={2}
                py={0.3}
                backdropFilter="blur(4px)"
              >
                {filteredItems.length} {filteredItems.length === 1 ? 'Module' : 'Modules'}
              </Badge>
            </Flex>
          </Box>

          {/* Quick Search Filter */}
          <Box px={3.5} pt={3} pb={1} bg={drawerBg}>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="#94A3B8" size={14} />
              </InputLeftElement>
              <Input
                placeholder="Find a module or sub-item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={searchBg}
                borderColor={searchBorder}
                borderRadius="12px"
                fontSize="12.5px"
                fontWeight="500"
                boxShadow="0 1px 3px rgba(0,0,0,0.03)"
                _focus={{
                  borderColor: 'teal.400',
                  boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)',
                }}
                _placeholder={{ color: 'gray.400' }}
              />
              {searchQuery && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear search"
                    icon={<FiX size={12} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setSearchQuery('')}
                  />
                </InputRightElement>
              )}
            </InputGroup>
          </Box>

          {/* Scrollable Modern Modules List */}
          <DrawerBody px={3.5} py={2} className="customScrollBar" flex={1} minH={0} overflowY="auto">
            {filteredItems.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={12}
                textAlign="center"
                color={subtextColor}
              >
                <Icon as={FiSearch} boxSize="28px" mb={2} opacity={0.4} />
                <Text fontSize="13px" fontWeight="600">
                  No modules match &quot;{searchQuery}&quot;
                </Text>
                <Text fontSize="11px" mt={1}>
                  Try searching for staff, lab, or appointments
                </Text>
              </Flex>
            ) : (
              <Accordion
                allowMultiple
                defaultIndex={defaultExpandedIndex}
                width="100%"
              >
                {filteredItems.map((item: SidebarItem) => {
                  const itemIsActive = isItemActive(item);
                  const hasChildren = !!item.children && item.children.length > 0;
                  const badgeStyle = getItemBadgeStyle(item);

                  return (
                    <AccordionItem
                      key={item.id}
                      border="none"
                      mb={2.5}
                      borderRadius="16px"
                      bg={itemIsActive && !hasChildren ? activeBg : cardBg}
                      boxShadow={
                        itemIsActive
                          ? '0 4px 14px rgba(13, 148, 136, 0.14)'
                          : '0 1px 4px rgba(0, 0, 0, 0.04)'
                      }
                      borderWidth="1px"
                      borderColor={itemIsActive ? activeBorder : cardBorder}
                      overflow="hidden"
                      position="relative"
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      _hover={{
                        borderColor: itemIsActive ? activeBorder : cardBorderHover,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.07)',
                        transform: 'translateY(-1px)',
                      }}
                    >
                      {() => (
                        <>
                          {/* Active Left Indicator Bar */}
                          {itemIsActive && (
                            <Box
                              position="absolute"
                              left={0}
                              top={0}
                              bottom={0}
                              w="3.5px"
                              bgGradient="linear(to-b, #0EA5E9, #0D9488)"
                              zIndex={2}
                            />
                          )}

                          <AccordionButton
                            px={3}
                            py={2.5}
                            bg="transparent"
                            _hover={{ bg: 'transparent' }}
                            _focus={{ boxShadow: 'none' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!hasChildren) {
                                onLeafClick(item);
                              } else {
                                onClick(item);
                              }
                            }}
                          >
                            <Flex
                              align="center"
                              justify="space-between"
                              width="100%"
                            >
                              <Flex align="center" gap={3} flex={1} minW={0}>
                                {/* Refined Pastel Squircle Icon */}
                                <Flex
                                  align="center"
                                  justify="center"
                                  w="40px"
                                  h="40px"
                                  minW="40px"
                                  borderRadius="12px"
                                  bg={badgeStyle.bg}
                                  bgGradient={badgeStyle.gradient}
                                  color={badgeStyle.color}
                                  boxShadow={`0 3px 10px ${badgeStyle.shadow}`}
                                  transition="transform 0.2s"
                                  _hover={{ transform: 'scale(1.05)' }}
                                >
                                  {renderDrawerIcon(item.icon, '19px')}
                                </Flex>

                                {/* Title & Subtitle */}
                                <Box textAlign="left" flex={1} minW={0}>
                                  <Text
                                    fontSize="13.5px"
                                    fontWeight={itemIsActive ? 750 : 650}
                                    color={
                                      itemIsActive
                                        ? useColorModeValue('teal.700', 'teal.300')
                                        : textColor
                                    }
                                    noOfLines={1}
                                    letterSpacing="-0.15px"
                                  >
                                    {t(`sidebar.${item.name}`, item.name)}
                                  </Text>

                                  {hasChildren ? (
                                    <HStack spacing={1} mt={0.5}>
                                      <Badge
                                        fontSize="9.5px"
                                        fontWeight="700"
                                        borderRadius="md"
                                        px={1.5}
                                        py={0.2}
                                        bg={
                                          itemIsActive
                                            ? useColorModeValue('teal.100', 'teal.900')
                                            : useColorModeValue('gray.100', 'gray.700')
                                        }
                                        color={
                                          itemIsActive
                                            ? useColorModeValue('teal.800', 'teal.200')
                                            : useColorModeValue('gray.600', 'gray.300')
                                        }
                                      >
                                        {item.children?.length} sections
                                      </Badge>
                                    </HStack>
                                  ) : (
                                    <Text
                                      fontSize="10.5px"
                                      color={subtextColor}
                                      noOfLines={1}
                                      mt={0.5}
                                    >
                                      {badgeStyle.sublabel}
                                    </Text>
                                  )}
                                </Box>
                              </Flex>

                              {/* Right Chevron / Action Disk */}
                              <Flex align="center" pl={2}>
                                {hasChildren ? (
                                  <Flex
                                    w="26px"
                                    h="26px"
                                    align="center"
                                    justify="center"
                                    borderRadius="full"
                                    bg={useColorModeValue('gray.100', 'gray.700')}
                                    color={subtextColor}
                                  >
                                    <AccordionIcon fontSize="14px" />
                                  </Flex>
                                ) : (
                                  <Flex
                                    w="26px"
                                    h="26px"
                                    align="center"
                                    justify="center"
                                    borderRadius="full"
                                    bg={
                                      itemIsActive
                                        ? 'teal.500'
                                        : useColorModeValue('gray.100', 'gray.700')
                                    }
                                    color={itemIsActive ? 'white' : subtextColor}
                                    boxShadow={
                                      itemIsActive
                                        ? '0 2px 6px rgba(13, 148, 136, 0.3)'
                                        : 'none'
                                    }
                                  >
                                    <Icon
                                      as={FiChevronRight}
                                      boxSize="13px"
                                      strokeWidth={2.5}
                                    />
                                  </Flex>
                                )}
                              </Flex>
                            </Flex>
                          </AccordionButton>

                          {/* Sleek Sub-Menu Tree */}
                          {hasChildren && (
                            <AccordionPanel
                              px={2.5}
                              pt={1}
                              pb={2.5}
                              bg={useColorModeValue('gray.50', '#162032')}
                              borderTop="1px dashed"
                              borderColor={useColorModeValue('gray.200', 'gray.700')}
                            >
                              <VStack
                                align="stretch"
                                spacing={1}
                                pl={2.5}
                                borderLeft="2px solid"
                                borderColor={useColorModeValue(
                                  'teal.200',
                                  'teal.700'
                                )}
                                my={1}
                              >
                                {item.children?.map((child: SidebarItem) => {
                                  const childActive = child.id === activeItemId;
                                  return (
                                    <Flex
                                      key={child.id}
                                      align="center"
                                      justify="space-between"
                                      px={3}
                                      py={2}
                                      borderRadius="10px"
                                      cursor="pointer"
                                      bg={
                                        childActive
                                          ? useColorModeValue('teal.100', 'rgba(20, 184, 166, 0.22)')
                                          : 'transparent'
                                      }
                                      color={
                                        childActive
                                          ? useColorModeValue('teal.900', 'teal.200')
                                          : textColor
                                      }
                                      fontWeight={childActive ? 750 : 550}
                                      transition="all 0.15s ease"
                                      _hover={{
                                        bg: childActive
                                          ? useColorModeValue('teal.100', 'rgba(20, 184, 166, 0.22)')
                                          : useColorModeValue('white', 'gray.750'),
                                        color: useColorModeValue('teal.700', 'teal.300'),
                                        transform: 'translateX(3px)',
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onLeafClick(child);
                                      }}
                                    >
                                      <Flex align="center" gap={2.5}>
                                        <Icon
                                          as={
                                            childActive
                                              ? (FiCheckCircle as any)
                                              : (FaCircle as any)
                                          }
                                          boxSize={childActive ? '11px' : '6px'}
                                          color={
                                            childActive
                                              ? 'teal.500'
                                              : 'gray.400'
                                          }
                                        />
                                        <Text fontSize="12.5px">
                                          {t(`sidebar.${child.name}`, child.name)}
                                        </Text>
                                      </Flex>
                                      <Icon
                                        as={FiChevronRight}
                                        boxSize="13px"
                                        color={
                                          childActive ? 'teal.500' : 'gray.400'
                                        }
                                      />
                                    </Flex>
                                  );
                                })}
                              </VStack>
                            </AccordionPanel>
                          )}
                        </>
                      )}
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </DrawerBody>

          {/* Elevated Executive Footer with Safe-Area Inset */}
          <DrawerFooter
            px={4}
            pt={3}
            pb="calc(18px + env(safe-area-inset-bottom, 12px))"
            bg={cardBg}
            borderTop="1px solid"
            borderColor={cardBorder}
            display="flex"
            flexDirection="column"
            gap={2.5}
            boxShadow="0 -4px 16px rgba(0, 0, 0, 0.04)"
          >
            {/* User Profile Row */}
            <Flex align="center" justify="space-between" width="100%">
              <Flex align="center" gap={2.5} flex={1} minW={0}>
                <Box position="relative">
                  <Avatar
                    size="sm"
                    src={user?.pic?.url || undefined}
                    name={user?.name || 'Doctor'}
                    border="2px solid"
                    borderColor="teal.400"
                    boxShadow="sm"
                  />
                  <Box
                    position="absolute"
                    bottom="-1px"
                    right="-1px"
                    w="9px"
                    h="9px"
                    borderRadius="full"
                    bg="#22C55E"
                    border="1.5px solid white"
                  />
                </Box>

                <Box textAlign="left" flex={1} minW={0}>
                  <Text
                    fontSize="13px"
                    fontWeight="750"
                    color={textColor}
                    noOfLines={1}
                    letterSpacing="-0.15px"
                  >
                    {user?.name || 'Clinic Doctor'}
                  </Text>
                  <Text
                    fontSize="10.5px"
                    color={subtextColor}
                    noOfLines={1}
                  >
                    {user?.email || (user?.userType ? `${user.userType} • Active` : 'Online')}
                  </Text>
                </Box>
              </Flex>

              {/* Logout Action Pill */}
              <Button
                size="xs"
                leftIcon={<FiLogOut size={13} />}
                colorScheme="red"
                variant="subtle"
                borderRadius="full"
                px={3}
                py={1.5}
                fontWeight="700"
                fontSize="11px"
                boxShadow="xs"
                _hover={{
                  bg: 'red.100',
                  transform: 'scale(1.04)',
                }}
                _active={{ transform: 'scale(0.96)' }}
                onClick={() => {
                  onClose();
                  doLogout();
                  router.push('/login');
                }}
              >
                Logout
              </Button>
            </Flex>

            {/* Secure Platform Tag */}
            <Text
              fontSize="9.5px"
              color={subtextColor}
              textAlign="center"
              letterSpacing="0.4px"
              fontWeight="500"
            >
              Dental Portal • v2.4 • Secure Cloud Sync ⚡
            </Text>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);

export default MobileDrawer;
