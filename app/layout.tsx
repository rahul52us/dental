"use client";

import { observer } from "mobx-react-lite";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { theme } from "./theme/theme";
import { lato } from "./theme/theme";
import MainLayout from "./layouts/mainLayout/MainLayout";
import AuthenticationLayout from "./layouts/authenticationLayout/AuthenticationLayout";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import stores from "./store/stores";
import Notification from "./component/common/Notification/Notification";
import Script from "next/script";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import DashboardLayout from "./layouts/dashboardLayout/DashboardLayout";
import { getMetadataForPath, PageMetadata } from "./metadata";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const RootLayout = observer(({ children }: { children: React.ReactNode }) => {
  const { companyStore: { getCompanyDetails } } = stores;
  const pathname = usePathname();
  const [metadata, setMetadata] = useState<PageMetadata>({
    title: 'Mental Health Clinic In Noida | Best Psychologist In Noida | Metamind',
    description: 'Searching for the best mental health doctor in Noida? Metamind, a trusted mental health clinic in Noida, offers expert care from top psychologists. Consult the best psychologist in Noida for therapy, counseling, and mental wellness now.'
  });

  useEffect(() => {
    getCompanyDetails();
  }, [getCompanyDetails]);

  useEffect(() => {
    if (pathname) {
      const pageMetadata = getMetadataForPath(pathname);
      setMetadata(pageMetadata);
      document.title = pageMetadata.title;
    }
  }, [pathname]);

  const getLayout = () => {
    if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
      return AuthenticationLayout;
    } else if (pathname.startsWith("/dashboard")) {
      return DashboardLayout;
    }
    return MainLayout;
  };

  const LayoutComponent = getLayout();

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:image" content="https://www.metamindhealth.com/images/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />

        <ColorModeScript initialColorMode="light" />
      </head>

      <body className={`${lato.className} ${montserrat.className}`}>

        <ChakraProvider theme={theme}>
          <Notification />
          <LayoutComponent>{children}</LayoutComponent>
        </ChakraProvider>
      </body>
    </html>
  );
});

export default RootLayout;