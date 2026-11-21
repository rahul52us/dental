"use client";

import { observer } from "mobx-react-lite";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { theme } from "./theme/theme";
import MainLayout from "./layouts/mainLayout/MainLayout";
import AuthenticationLayout from "./layouts/authenticationLayout/AuthenticationLayout";
import DashboardLayout from "./layouts/dashboardLayout/DashboardLayout";
import { usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import stores from "./store/stores";
import Notification from "./component/common/Notification/Notification";
import { getMetadataForPath, PageMetadata } from "./metadata";
import "./config/i18n";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";

const RootLayout = observer(({ children }: { children: React.ReactNode }) => {
  const {
    companyStore: { getCompanyDetails },
    auth: { user },
  } = stores;
  const pathname = usePathname();
  const [metadata, setMetadata] = useState<PageMetadata>({
    title: "Dental",
    description:
      "Searching for the best dental doctor? dental, a trusted dental clinic, offers expert care from top dentalists. Consult the best dental, counseling, and doctor wellness now.",
  });

  useEffect(() => {
    if (user) {
      getCompanyDetails();
    }
  }, [getCompanyDetails, user]);

  useEffect(() => {
    if (pathname) {
      const pageMetadata = getMetadataForPath(pathname);
      setMetadata(pageMetadata);
      if (typeof window !== "undefined") {
        document.title = pageMetadata.title;
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const light = stores.themeStore.themeConfig?.colors?.custom?.light?.primary || "#0D9488";
      const dark = stores.themeStore.themeConfig?.colors?.custom?.dark?.primary || "#134E4A";
      stores.themeStore.applyCssVariables(light, dark);
    }
  }, []);

  const getLayout = () => {
    if (
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password" ||
      pathname?.startsWith("/reset-password")
    ) {
      return AuthenticationLayout;
    } else if (pathname?.startsWith("/dashboard")) {
      return DashboardLayout;
    }
    return MainLayout;
  };

  const LayoutComponent = getLayout();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta
          property="og:image"
          content="https://www.Dentalhealth.com/images/logo.png"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <ColorModeScript initialColorMode="light" />
      </head>
      <body suppressHydrationWarning>
        <ChakraProvider theme={theme}>
          <Notification />
          <Suspense fallback={null}>
            <LayoutComponent>{children}</LayoutComponent>
          </Suspense>
        </ChakraProvider>
      </body>
    </html>
  );
});

export default RootLayout;