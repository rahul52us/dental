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
  url?: string;
  isMore?: boolean;
  icon: (props: { color: string }) => React.ReactNode;
}

const navItems: NavItemConfig[] = [
  {
    id: 1,
    name: 'Dashboard',
    labelKey: 'sidebar.Dashboard',
    defaultLabel: 'Dashboard',
    url: '/dashboard',
    icon: ({ color }) => <Icon as={FaChartPie} boxSize="20px" color={color} />,
  },
  {
    id: 21,
    name: 'Patients',
    labelKey: 'sidebar.Patients',
    defaultLabel: 'Patients',
    url: '/dashboard/patients',
    icon: ({ color }) => <Icon as={FaUsers} boxSize="20px" color={color} />,
  },
  {
    id: 15,
    name: 'Book Appointment',
    labelKey: 'sidebar.Book Appointment',
    defaultLabel: 'Book Appointment',
    url: '/dashboard/appointments/book',
    icon: ({ color }) => <AppointmentIcon width="20px" height="20px" color={color} />,
  },
  {
    id: 16,
    name: 'Waiting Room',
    labelKey: 'sidebar.Waiting Room',
    defaultLabel: 'Waiting Room',
    url: '/dashboard/appointments/waiting-room',
    icon: ({ color }) => <WaitingRoomIcon width="20px" height="20px" color={color} />,
  },
  {
    id: 9999,
    name: 'More',
    labelKey: 'sidebar.More',
    defaultLabel: 'More',
    isMore: true,
    icon: ({ color }) => <Icon as={FiGrid} boxSize="20px" color={color} />,
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

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const inactiveColor = useColorModeValue('gray.500', 'gray.400');
    const inactiveTextColor = useColorModeValue('gray.600', 'gray.400');

    const activeColor = useColorModeValue(
      themeConfig?.colors?.custom?.light?.primary || '#3182ce',
      themeConfig?.colors?.custom?.dark?.primary || '#63b3ed'
    );
    const activeBgPill = useColorModeValue('blue.50', 'whiteAlpha.200');

    const isItemActive = (item: NavItemConfig): boolean => {
      if (item.isMore) {
        if (openMobileSideDrawer) return true;
        if (!pathname) return false;
        const isDashboard = pathname === '/dashboard';
        const isPatients = pathname.startsWith('/dashboard/patients');
        const isBook = pathname.startsWith('/dashboard/appointments/book');
        const isWaitingRoom = pathname.startsWith('/dashboard/appointments/waiting-room');
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
        minH="62px"
        height="calc(62px + env(safe-area-inset-bottom, 0px))"
        paddingBottom="env(safe-area-inset-bottom, 0px)"
        bg={bgColor}
        borderTop="1px solid"
        borderTopColor={borderColor}
        boxShadow="0 -3px 16px rgba(0, 0, 0, 0.08)"
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
          const userColor = themeConfig?.sidebarColors?.[item.name];
          const customActiveColor = userColor
            ? (colorMode === 'light' ? userColor.light : userColor.dark)
            : activeColor;

          const itemColor = active ? customActiveColor : inactiveColor;
          const textColor = active ? customActiveColor : inactiveTextColor;

          return (
            <Flex
              as="button"
              key={item.id}
              flex={1}
              height="100%"
              direction="column"
              align="center"
              justify="center"
              py={1.5}
              px={0.5}
              bg="transparent"
              border="none"
              outline="none"
              cursor="pointer"
              aria-current={active ? 'page' : undefined}
              aria-label={t(item.labelKey, item.defaultLabel)}
              onClick={() => handleClick(item)}
              transition="all 0.2s ease-in-out"
              _active={{ transform: 'scale(0.93)' }}
              _focus={{ boxShadow: 'none' }}
              minW={0}
            >
              <Flex
                align="center"
                justify="center"
                w="48px"
                h="28px"
                borderRadius="full"
                bg={active ? activeBgPill : 'transparent'}
                transition="all 0.2s ease-in-out"
                mb="2px"
              >
                {item.icon({ color: itemColor })}
              </Flex>
              <Text
                fontSize={{ base: '9.5px', sm: '10.5px' }}
                fontWeight={active ? 700 : 500}
                color={textColor}
                textAlign="center"
                lineHeight="1.15"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                maxW="100%"
                px="1px"
              >
                {t(item.labelKey, item.defaultLabel)}
              </Text>
            </Flex>
          );
        })}
      </Box>
    );
  }
);

export default MobileBottomNav;
