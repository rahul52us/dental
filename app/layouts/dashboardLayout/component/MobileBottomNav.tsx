'use client';

import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  useColorMode,
} from '@chakra-ui/react';
import { useRouter, usePathname } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { FaChartPie, FaUsers } from 'react-icons/fa';
import { FiGrid } from 'react-icons/fi';
import stores from '../../../store/stores';
import AppointmentIcon from '../SidebarLayout/component/AppointmentIcon';
import WaitingRoomIcon from '../SidebarLayout/component/WaitingRoomIcon';

export interface MobileBottomNavProps {
  onItemClick?: (item: any) => void;
  openMobileSideDrawer?: boolean;
  setOpenMobileSideDrawer?: (status: boolean) => void;
}

interface NavItemConfig {
  id: number;
  name: string;
  labelKey: string;
  defaultLabel: string;
  shortLabel: string;
  url?: string;
  isMore?: boolean;
  icon: (props: { color: string; isActive: boolean }) => React.ReactNode;
}

const navItems: NavItemConfig[] = [
  {
    id: 1,
    name: 'Dashboard',
    labelKey: 'sidebar.Dashboard',
    defaultLabel: 'Dashboard',
    shortLabel: 'Dashboard',
    url: '/dashboard',
    icon: ({ color }) => <Icon as={FaChartPie} boxSize="19px" color={color} />,
  },
  {
    id: 21,
    name: 'Patients',
    labelKey: 'sidebar.Patients',
    defaultLabel: 'Patients',
    shortLabel: 'Patients',
    url: '/dashboard/patients',
    icon: ({ color }) => <Icon as={FaUsers} boxSize="19px" color={color} />,
  },
  {
    id: 15,
    name: 'Book Appointment',
    labelKey: 'sidebar.Book Appointment',
    defaultLabel: 'Book Appointment',
    shortLabel: 'Book',
    url: '/dashboard/appointments/book',
    icon: ({ color }) => <AppointmentIcon width="19px" height="19px" color={color} />,
  },
  {
    id: 16,
    name: 'Waiting Room',
    labelKey: 'sidebar.Waiting Room',
    defaultLabel: 'Waiting Room',
    shortLabel: 'Waiting',
    url: '/dashboard/appointments/waiting-room',
    icon: ({ color }) => <WaitingRoomIcon width="19px" height="19px" color={color} />,
  },
  {
    id: 9999,
    name: 'More',
    labelKey: 'sidebar.More',
    defaultLabel: 'More',
    shortLabel: 'More',
    isMore: true,
    icon: ({ color }) => <Icon as={FiGrid} boxSize="19px" color={color} />,
  },
];

const MobileBottomNav: React.FC<MobileBottomNavProps> = observer(
  ({ onItemClick }) => {
    const {
      layout: { openMobileSideDrawer, setOpenMobileSideDrawer },
      themeStore: { themeConfig },
    } = stores;
    const router = useRouter();
    const pathname = usePathname();
    const { colorMode } = useColorMode();
    const { t } = useTranslation();

    const bgColor = useColorModeValue(
      'rgba(255, 255, 255, 0.96)',
      'rgba(15, 23, 42, 0.96)'
    );
    const borderColor = useColorModeValue(
      'rgba(226, 232, 240, 0.85)',
      'rgba(51, 65, 85, 0.6)'
    );
    const inactiveColor = useColorModeValue('#94A3B8', '#64748B');
    const inactiveTextColor = useColorModeValue('#64748B', '#94A3B8');

    const activeColor = useColorModeValue('#0D9488', '#5EEAD4');
    const activeTextColor = useColorModeValue('#0F766E', '#5EEAD4');
    const activeBgPill = useColorModeValue(
      'linear-gradient(135deg, rgba(204, 251, 241, 0.75) 0%, rgba(224, 242, 254, 0.75) 100%)',
      'rgba(20, 184, 166, 0.22)'
    );

    const isItemActive = (item: NavItemConfig): boolean => {
      if (item.isMore) {
        if (openMobileSideDrawer) return true;
        if (!pathname) return false;
        const isDashboard = pathname === '/dashboard';
        const isPatients = pathname.startsWith('/dashboard/patients');
        const isBook = pathname.startsWith('/dashboard/appointments/book');
        const isWaitingRoom = pathname.startsWith(
          '/dashboard/appointments/waiting-room'
        );
        return !isDashboard && !isPatients && !isBook && !isWaitingRoom;
      }

      if (!pathname || !item.url) return false;

      if (item.url === '/dashboard') {
        return pathname === '/dashboard';
      }

      return pathname.startsWith(item.url);
    };

    const handleClick = (item: NavItemConfig) => {
      if (item.isMore) {
        setOpenMobileSideDrawer(!openMobileSideDrawer);
        return;
      }

      if (openMobileSideDrawer) {
        setOpenMobileSideDrawer(false);
      }

      localStorage.setItem('activeSidebarItemId', item.id.toString());
      localStorage.setItem('activeComponentName', item.id.toString());
      onItemClick?.(item);

      if (item.url && pathname !== item.url) {
        router.push(item.url);
      }
    };

    return (
      <Box
        as="nav"
        role="navigation"
        aria-label="Mobile Bottom Navigation"
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        width="100%"
        minH="64px"
        height="calc(64px + env(safe-area-inset-bottom, 8px))"
        paddingBottom="env(safe-area-inset-bottom, 8px)"
        bg={bgColor}
        backdropFilter="blur(20px)"
        borderTop="1px solid"
        borderTopColor={borderColor}
        boxShadow="0 -8px 25px rgba(0, 0, 0, 0.07)"
        zIndex={100}
        display={{ base: 'flex', lg: 'none' }}
        alignItems="center"
        justifyContent="space-around"
        px={1}
        userSelect="none"
        style={{
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {navItems.map((item) => {
          const active = isItemActive(item);
          const itemColor = active ? activeColor : inactiveColor;
          const displayLabel = item.shortLabel;

          return (
            <Flex
              as="button"
              key={item.id}
              flex={1}
              height="100%"
              direction="column"
              align="center"
              justify="center"
              py={1}
              px={0.5}
              bg="transparent"
              border="none"
              outline="none"
              cursor="pointer"
              aria-current={active ? 'page' : undefined}
              aria-label={t(item.labelKey, item.defaultLabel)}
              onClick={() => handleClick(item)}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _active={{ transform: 'scale(0.92)' }}
              _focus={{ boxShadow: 'none' }}
              minW={0}
            >
              {/* Active Squircle / Pill */}
              <Flex
                align="center"
                justify="center"
                w="46px"
                h="28px"
                borderRadius="12px"
                bg={active ? activeBgPill : 'transparent'}
                boxShadow={
                  active ? '0 2px 8px rgba(13, 148, 136, 0.16)' : 'none'
                }
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                transform={active ? 'scale(1.05)' : 'scale(1)'}
                mb="2px"
              >
                {item.icon({ color: itemColor, isActive: active })}
              </Flex>

              {/* Tab Label (No Truncation) */}
              <Text
                fontSize={{ base: '10px', sm: '11px' }}
                fontWeight={active ? 750 : 550}
                color={active ? activeTextColor : inactiveTextColor}
                textAlign="center"
                lineHeight="1.2"
                whiteSpace="nowrap"
                noOfLines={1}
                letterSpacing="-0.15px"
                px="1px"
              >
                {displayLabel}
              </Text>

              {/* Glowing Bottom Indicator Pill */}
              <Box
                w={active ? '14px' : '0px'}
                h="2.5px"
                borderRadius="full"
                bgGradient="linear(to-r, #0EA5E9, #0D9488)"
                mt="2px"
                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                opacity={active ? 1 : 0}
              />
            </Flex>
          );
        })}
      </Box>
    );
  }
);

export default MobileBottomNav;
