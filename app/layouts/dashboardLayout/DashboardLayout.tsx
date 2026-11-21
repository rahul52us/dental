'use client';

import { Suspense, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { usePathname, useSearchParams } from 'next/navigation';
import { Box, Spinner, useBreakpointValue, useColorModeValue, useMediaQuery, useTheme } from '@chakra-ui/react';
import styled from 'styled-components';
import stores from '../../store/stores';
// import { authenticastion } from '../../config/utils/routes';
import SidebarLayout from './SidebarLayout/SidebarLayout';
import HeaderLayout from './HeaderLayout/HeaderLayout';
// import PermissionDeniedPage from '../../component/common/Loader/PermissionDeniedPage';
import { contentLargeBodyPadding, contentSmallBodyPadding, headerHeight, mobileHeaderHeight, mediumSidebarWidth } from '../../component/config/utils/variable';
import PageLoader from '../../component/common/Loader/PageLoader';
import ProfileDetailsModal from '../../component/ProfileSettings/component/ProfileDetailsModal/ProfileDetailsModal';
import AdvertisementBanner from './AdvertisementBanner';
import MobileBottomNav from './component/MobileBottomNav';
import { getActiveModuleFromUrl } from './SidebarLayout/utils/SidebarItems';

// Isolated module theme synchronizer wrapped in Suspense to prevent SSG bailout
const ModuleThemeSync = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const { activeItem, parentItem } = getActiveModuleFromUrl(
        pathname,
        searchParams?.toString()
      );
      if (activeItem) {
        stores.themeStore.applyActiveModuleTheme(
          activeItem.name,
          parentItem?.name
        );
      } else {
        stores.themeStore.applyActiveModuleTheme();
      }
    }
    // Only re-run on actual navigation changes, NOT on every sidebarColors update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null;
};

const DashboardLayout = observer(({ children }: { children: React.ReactNode }) => {
  const {
    auth: { user },
    dashboardStore : {getMasterData},
    layout: { fullScreenMode, mediumScreenMode, isCallapse, openDashSidebarFun, openMobileSideDrawer, setOpenMobileSideDrawer },
    themeStore: { themeConfig },
  } = stores;
  const theme = useTheme();

  const [sizeStatus] = useMediaQuery(`(max-width: ${theme.breakpoints.xl})`);
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const currentPrimary = themeConfig.colors.custom.light.primary || '#0D9488';
  const currentDarkPrimary = themeConfig.colors.custom.dark.primary || '#134E4A';

  const headerBgColor = useColorModeValue(
    themeConfig.colors.custom.light.primary,
    themeConfig.colors.custom.dark.primary
  );

  const headerGradient = useColorModeValue(
    `linear-gradient(135deg, #091E42 0%, ${currentDarkPrimary} 45%, ${currentPrimary} 100%)`,
    `linear-gradient(135deg, #020617 0%, #0F172A 50%, ${currentDarkPrimary} 100%)`
  );

  // Ensure CSS variables are synchronized with current theme on mount and change
  useEffect(() => {
    stores.themeStore.applyCssVariables(currentPrimary, currentDarkPrimary);
  }, [currentPrimary, currentDarkPrimary]);

  const closeDrawerModel = () => {
    setOpenMobileSideDrawer(false);
  };

  const handleSidebarItemClick = (item: any) => {
    if (!item.children || item.url) {
      localStorage.setItem('activeComponentName', item.id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        openDashSidebarFun(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCallapse, openDashSidebarFun]);

  useEffect(() => {
    if(user){
    getMasterData()
    }
  },[user , getMasterData])

  return user ? (
    <Box>
      <Suspense fallback={null}>
        <ModuleThemeSync />
      </Suspense>
      <MainContainer
        $isMobile={isMobile}
        $sidebarWidth={isCallapse ? mediumSidebarWidth : '250px'}
      >
        <Box ref={sidebarRef}>
          <SidebarLayout
            onItemClick={handleSidebarItemClick}
            isCollapsed={isCallapse}
            onLeafItemClick={handleSidebarItemClick}
            openMobileSideDrawer={openMobileSideDrawer}
            setOpenMobileSideDrawer={closeDrawerModel}
          />
        </Box>
        <Container $fullScreenMode={fullScreenMode}>
          <HeaderContainer
            $isMobile={isMobile}
            $sizeStatus={sizeStatus}
            $mediumScreenMode={mediumScreenMode}
            $fullScreenMode={fullScreenMode}
            $backgroundColor={headerBgColor}
            $headerGradient={headerGradient}
            $sidebarWidth={isCallapse ? mediumSidebarWidth : '250px'}
          >
            <HeaderLayout />
          </HeaderContainer>
          <ContentContainer
            $isMobile={isMobile}
            $mediumScreenMode={mediumScreenMode}
            className={
              fullScreenMode ? 'fullscreen' : mediumScreenMode ? 'mediumScreen' : ''
            }
            $fullScreenMode={fullScreenMode}
            $sizeStatus={sizeStatus}
            $sidebarWidth={isCallapse ? mediumSidebarWidth : '250px'}
          >
            <AdvertisementBanner />
            {children}
          </ContentContainer>
        </Container>
      </MainContainer>
      <ProfileDetailsModal user={user} />
      {isMobile && (
        <MobileBottomNav
          onItemClick={handleSidebarItemClick}
        />
      )}
    </Box>
  ) : (
    <PageLoader loading={true}>
      <div />
    </PageLoader>
  );
});

export default DashboardLayout;

const MainContainer = styled.div<{
  $isMobile: boolean;
  $sidebarWidth: string;
}>`
  display: flex;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  margin-left: ${(props) => (props.$isMobile ? '0px' : props.$sidebarWidth)};
`;

const Container = styled.div<{ $fullScreenMode: boolean }>`
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-in-out;
`;

const HeaderContainer = styled.div<{
  $fullScreenMode: boolean;
  $sizeStatus: boolean;
  $mediumScreenMode: boolean;
  $backgroundColor: string;
  $isMobile: boolean;
  $headerGradient: string;
  $sidebarWidth: string;
}>`
  z-index: 99;
  height: ${(props) => (props.$isMobile ? mobileHeaderHeight : headerHeight)};
  position: fixed;
  top: 0;
  right: 0;
  background: ${(props) =>
    props.$isMobile ? props.$headerGradient : props.$backgroundColor};
  box-shadow: ${(props) =>
    props.$isMobile
      ? '0 4px 20px rgba(13, 148, 136, 0.2)'
      : '0 4px 15px rgba(0, 0, 0, 0.05)'};
  left: ${(props) => (props.$isMobile ? '0px' : props.$sidebarWidth)};
  transition: all 0.3s ease-in-out;
`;

const ContentContainer = styled.div<{
  $sizeStatus: boolean;
  $fullScreenMode: boolean;
  $mediumScreenMode: boolean;
  $isMobile: boolean;
  $sidebarWidth: string;
}>`
  padding: ${({ $isMobile }) =>
    $isMobile
      ? `${contentSmallBodyPadding} ${contentSmallBodyPadding} calc(80px + env(safe-area-inset-bottom, 0px)) ${contentSmallBodyPadding}`
      : `${contentLargeBodyPadding}`};
  width: ${({ $isMobile, $sidebarWidth }) =>
    $isMobile ? '100vw' : `calc(100vw - ${$sidebarWidth})`};
  overflow-x: hidden;
  height: ${({ $isMobile }) =>
    $isMobile
      ? `calc(100vh - ${mobileHeaderHeight})`
      : `calc(100vh - ${headerHeight})`};
  transition: all 0.3s ease-in-out;
  margin-top: ${({ $isMobile }) =>
    $isMobile ? mobileHeaderHeight : headerHeight};
`;