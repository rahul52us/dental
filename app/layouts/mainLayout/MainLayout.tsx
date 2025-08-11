"use client";

import { Box } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./component/Header/Header";
import { Footer } from "./component/Footer/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname(); // Get current route

  // Hide header only on /landingPage
  const showHeader = pathname !== "/landingPage";

  return (
    <>
      {showHeader && <Header />}
      <Box as="main">{children}</Box>
      <Footer />
    </>
  );
};

export default MainLayout;
