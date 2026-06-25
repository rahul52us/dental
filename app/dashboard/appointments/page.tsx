"use client";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import DashPageHeader from "../../component/common/DashPageHeader/DashPageHeader";
import DashPageTitle from "../../component/common/DashPageTitle/DashPageTitle";
import Contactlist from "./Appointments";
import { useTranslation } from "react-i18next";

const Booking = observer(() => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box display="none">
        <DashPageHeader
          breadcrumb={[]}
        />
      </Box>
      <DashPageTitle
        title={t("appointments.page.title")}
        subTitle={t("appointments.page.subTitle")}
      />
      <Box>
        <Contactlist
        />
      </Box>
    </Box>
  );
});

export default Booking;
