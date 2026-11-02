'use client';

import React from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiX, FiChevronRight, FiLogOut } from 'react-icons/fi';
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

const ITEM_BADGE_STYLES: Record<
  string,
  { bg: string; color: string; darkBg: string; darkColor: string }
> = {
  Users: {
    bg: '#EBF8FF',
    color: '#2B6CB0',
    darkBg: 'rgba(66, 153, 225, 0.2)',
    darkColor: '#63B3ED',
  },
  Lab: {
    bg: '#FFF5F5',
    color: '#E53E3E',
    darkBg: 'rgba(245, 101, 101, 0.2)',
    darkColor: '#FC8181',
  },
  'Doctor Inventory': {
    bg: '#FFF5F7',
    color: '#D53F8C',
    darkBg: 'rgba(237, 100, 166, 0.2)',
    darkColor: '#F687B3',
  },
  'Recall Appointment': {
    bg: '#E6FFFA',
    color: '#319795',
    darkBg: 'rgba(79, 209, 197, 0.2)',
    darkColor: '#81E6D9',
  },
  Appointments: {
    bg: '#FAF5FF',
    color: '#805AD5',
    darkBg: 'rgba(159, 122, 234, 0.2)',
    darkColor: '#B794F4',
  },
  Masters: {
    bg: '#E6FFFA',
    color: '#2C7A7B',
    darkBg: 'rgba(56, 178, 172, 0.2)',
    darkColor: '#4FD1C5',
  },
  Chairs: {
    bg: '#F3E8FF',
    color: '#7C3AED',
    darkBg: 'rgba(139, 92, 246, 0.2)',
    darkColor: '#A78BFA',
  },
  Reports: {
    bg: '#F0FDF4',
    color: '#16A34A',
    darkBg: 'rgba(72, 187, 120, 0.2)',
    darkColor: '#68D391',
  },
  'Global Accountability': {
    bg: '#FFF7ED',
    color: '#DD6B20',
    darkBg: 'rgba(237, 137, 54, 0.2)',
    darkColor: '#F6AD55',
  },
  Settings: {
    bg: '#F4F4F5',
    color: '#4A5568',
    darkBg: 'rgba(160, 174, 192, 0.2)',
    darkColor: '#CBD5E0',
  },
  Admins: {
    bg: '#EFF6FF',
    color: '#1D4ED8',
    darkBg: 'rgba(59, 130, 246, 0.2)',
    darkColor: '#93C5FD',
  },
  Advertisements: {
    bg: '#FEF3C7',
    color: '#D97706',
    darkBg: 'rgba(245, 158, 11, 0.2)',
    darkColor: '#FCD34D',
  },
  'Marketing Campaigns': {
    bg: '#FCE7F3',
    color: '#DB2777',
    darkBg: 'rgba(236, 72, 153, 0.2)',
    darkColor: '#F472B6',
  },
  'Global Settings': {
    bg: '#F1F5F9',
    color: '#475569',
    darkBg: 'rgba(148, 163, 184, 0.2)',
    darkColor: '#CBD5E1',
  },
};

const renderDrawerIcon = (icon: any, boxSize: string = '18px') => {
  if (!icon) return <Icon as={FaCircle as any} boxSize={boxSize} />;
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon as React.ReactElement<any>, {
      style: { width: boxSize, height: boxSize },
      size: parseInt(boxSize, 10) || 18,
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

    const cardBg = useColorModeValue('white', 'gray.800');
    const cardBorder = useColorModeValue('gray.100', 'gray.700');
    const cardBorderHover = useColorModeValue('blue.300', 'blue.500');
    const activeBorder = useColorModeValue('blue.500', 'blue.400');
    const activeBg = useColorModeValue('blue.50', 'rgba(49, 130, 206, 0.15)');
    const textColor = useColorModeValue('gray.800', 'gray.100');
    const subtextColor = useColorModeValue('gray.500', 'gray.400');
    const drawerBg = useColorModeValue('#F8FAFC', 'gray.900');

    const defaultExpandedIndex =
      expandedPath.length > 0 ? [expandedPath[0]] : [];

    const isItemActive = (item: SidebarItem): boolean => {
      if (item.id === activeItemId) return true;
      if (item.children) {
        return item.children.some(isItemActive);
      }
      return false;
    };

    const getItemBadgeStyle = (item: SidebarItem) => {
      const predefined = ITEM_BADGE_STYLES[item.name];
      if (predefined) {
        return {
          bg: colorMode === 'dark' ? predefined.darkBg : predefined.bg,
          color: colorMode === 'dark' ? predefined.darkColor : predefined.color,
        };
      }

      const customColor = themeConfig.sidebarColors?.[item.name];
      if (customColor) {
        const baseColor =
          colorMode === 'dark' ? customColor.dark : customColor.light;
        return {
          bg: `${baseColor}22`,
          color: baseColor,
        };
      }

      return {
        bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'blue.50',
        color: colorMode === 'dark' ? 'blue.300' : 'blue.600',
      };
    };

    return (
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <DrawerContent
          maxW={{ base: '88vw', sm: '360px' }}
          borderLeftRadius={{ base: '24px', sm: '28px' }}
          overflow="hidden"
          bg={drawerBg}
          boxShadow="-10px 0 35px rgba(0, 0, 0, 0.22)"
          display="flex"
          flexDirection="column"
        >
          {/* Awesome Header */}
          <Box
            bgGradient="linear(135deg, #1E3A8A 0%, #2563EB 55%, #38BDF8 100%)"
            px={4}
            pt={6}
            pb={5}
            position="relative"
            boxShadow="0 4px 20px rgba(37, 99, 235, 0.2)"
          >
            <Flex align="center" justify="space-between" mb={2}>
              <Flex
                align="center"
                gap={3}
                cursor="pointer"
                onClick={() => {
                  router.push('/dashboard');
                  onClose();
                }}
              >
                <Avatar
                  size="md"
                  src={
                    user?.companyDetails?.logo?.url || '/images/whiteLogo.png'
                  }
                  name={user?.companyDetails?.company_name || 'Dental Clinic'}
                  border="2px solid white"
                  boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                  bg="white"
                />
                <Box>
                  <Text
                    fontWeight="800"
                    fontSize="md"
                    color="white"
                    noOfLines={1}
                    letterSpacing="-0.2px"
                  >
                    {user?.companyDetails?.company_name || 'Dental Clinic'}
                  </Text>
                  <Flex align="center" gap={1.5} mt={0.5}>
                    <Text fontSize="xs" color="whiteAlpha.900" fontWeight="600">
                      {user?.name || 'Clinic App'}
                    </Text>
                    {user?.userType && (
                      <Badge
                        colorScheme="whiteAlpha"
                        bg="whiteAlpha.300"
                        color="white"
                        fontSize="9px"
                        borderRadius="full"
                        px={1.5}
                        py={0}
                        textTransform="capitalize"
                      >
                        {user.userType}
                      </Badge>
                    )}
                  </Flex>
                </Box>
              </Flex>

              <IconButton
                aria-label="Close menu"
                icon={<FiX size={18} strokeWidth={2.5} />}
                size="sm"
                color="white"
                bg="whiteAlpha.200"
                _hover={{ bg: 'whiteAlpha.300', transform: 'scale(1.08)' }}
                _active={{ bg: 'whiteAlpha.400' }}
                borderRadius="full"
                onClick={onClose}
                boxShadow="sm"
              />
            </Flex>

            <Flex
              align="center"
              justify="space-between"
              mt={3}
              pt={2}
              borderTop="1px solid rgba(255,255,255,0.15)"
            >
              <Text
                fontSize="10.5px"
                fontWeight="700"
                color="whiteAlpha.800"
                letterSpacing="0.8px"
                textTransform="uppercase"
              >
                Navigation Menu
              </Text>
              <Text fontSize="10.5px" color="whiteAlpha.700">
                {items.length} items
              </Text>
            </Flex>
          </Box>

          {/* Awesome Scrollable Menu Cards */}
          <DrawerBody px={3} py={3} className="customScrollBar" flex={1}>
            <Accordion
              allowMultiple
              defaultIndex={defaultExpandedIndex}
              width="100%"
            >
              {items.map((item: SidebarItem) => {
                const itemIsActive = isItemActive(item);
                const hasChildren = !!item.children && item.children.length > 0;
                const badgeStyle = getItemBadgeStyle(item);

                return (
                  <AccordionItem
                    key={item.id}
                    border="none"
                    mb={2}
                    borderRadius="14px"
                    bg={cardBg}
                    boxShadow={
                      itemIsActive
                        ? '0 4px 12px rgba(37, 99, 235, 0.12)'
                        : '0 1px 3px rgba(0, 0, 0, 0.04)'
                    }
                    borderWidth="1px"
                    borderColor={itemIsActive ? activeBorder : cardBorder}
                    overflow="hidden"
                    transition="all 0.2s ease-in-out"
                    _hover={{
                      borderColor: itemIsActive ? activeBorder : cardBorderHover,
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.06)',
                      transform: 'translateY(-1px)',
                    }}
                  >
                    {() => (
                      <>
                        <AccordionButton
                          px={3}
                          py={2.5}
                          bg={
                            itemIsActive && !hasChildren
                              ? activeBg
                              : 'transparent'
                          }
                          _hover={{
                            bg: itemIsActive ? activeBg : 'transparent',
                          }}
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
                              {/* Sleek Icon Badge */}
                              <Flex
                                align="center"
                                justify="center"
                                w="38px"
                                h="38px"
                                minW="38px"
                                borderRadius="11px"
                                bg={badgeStyle.bg}
                                color={badgeStyle.color}
                                boxShadow="sm"
                              >
                                {renderDrawerIcon(item.icon, '18px')}
                              </Flex>

                              {/* Label & Details */}
                              <Box textAlign="left" flex={1} minW={0}>
                                <Text
                                  fontSize="13.5px"
                                  fontWeight={itemIsActive ? 700 : 600}
                                  color={itemIsActive ? 'blue.600' : textColor}
                                  noOfLines={1}
                                  letterSpacing="-0.1px"
                                >
                                  {t(`sidebar.${item.name}`, item.name)}
                                </Text>
                                {hasChildren && (
                                  <Text
                                    fontSize="10.5px"
                                    color={subtextColor}
                                    noOfLines={1}
                                  >
                                    {item.children?.length} sections
                                  </Text>
                                )}
                              </Box>
                            </Flex>

                            {/* Right Arrow / Chevron */}
                            <Flex align="center" pl={1}>
                              {hasChildren ? (
                                <AccordionIcon
                                  color="gray.400"
                                  fontSize="18px"
                                  transition="transform 0.2s"
                                />
                              ) : (
                                <Icon
                                  as={FiChevronRight}
                                  color={itemIsActive ? 'blue.500' : 'gray.400'}
                                  boxSize="16px"
                                />
                              )}
                            </Flex>
                          </Flex>
                        </AccordionButton>

                        {/* Child Sub-Menu */}
                        {hasChildren && (
                          <AccordionPanel
                            px={2}
                            pt={0}
                            pb={2}
                            bg={useColorModeValue('gray.50', 'gray.850')}
                          >
                            <VStack
                              align="stretch"
                              spacing={1}
                              pl={2}
                              borderLeft="2px solid"
                              borderColor={useColorModeValue(
                                'blue.200',
                                'blue.800'
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
                                    borderRadius="8px"
                                    cursor="pointer"
                                    bg={childActive ? activeBg : 'transparent'}
                                    color={childActive ? 'blue.600' : textColor}
                                    fontWeight={childActive ? 700 : 500}
                                    transition="all 0.15s ease"
                                    _hover={{
                                      bg: childActive
                                        ? activeBg
                                        : useColorModeValue(
                                            'white',
                                            'gray.700'
                                          ),
                                      color: 'blue.600',
                                      transform: 'translateX(2px)',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onLeafClick(child);
                                    }}
                                  >
                                    <Flex align="center" gap={2}>
                                      <Icon
                                        as={FaCircle as any}
                                        boxSize="6px"
                                        color={
                                          childActive ? 'blue.500' : 'gray.400'
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
                                        childActive ? 'blue.500' : 'gray.400'
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
          </DrawerBody>

          {/* Awesome Footer Strip with User Info & Logout */}
          <DrawerFooter
            px={4}
            py={3}
            bg={cardBg}
            borderTop="1px solid"
            borderColor={cardBorder}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <Flex align="center" justify="space-between" width="100%">
              <Flex align="center" gap={2.5}>
                <Avatar
                  size="sm"
                  src={user?.pic?.url || undefined}
                  name={user?.name || 'User'}
                  border="2px solid"
                  borderColor={useColorModeValue('blue.500', 'blue.300')}
                />
                <Box textAlign="left">
                  <Text
                    fontSize="12.5px"
                    fontWeight="700"
                    color={textColor}
                    noOfLines={1}
                  >
                    {user?.name || 'User Profile'}
                  </Text>
                  <Text fontSize="10.5px" color={subtextColor} noOfLines={1}>
                    {user?.email || user?.userType || 'Clinic User'}
                  </Text>
                </Box>
              </Flex>

              <IconButton
                aria-label="Logout"
                icon={<FiLogOut size={16} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                borderRadius="full"
                title="Logout"
                _hover={{ bg: 'red.50' }}
                onClick={() => {
                  onClose();
                  doLogout();
                }}
              />
            </Flex>

            <Text
              fontSize="9.5px"
              color={subtextColor}
              textAlign="center"
              letterSpacing="0.3px"
            >
              Dental Cloud App • Secure & Connected
            </Text>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);

export default MobileDrawer;
