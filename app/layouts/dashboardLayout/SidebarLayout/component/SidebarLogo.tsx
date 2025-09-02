"use client";

import { Box, Flex, Text, useColorModeValue, Tooltip } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import NextImage from "next/image";
import { headerHeight } from "../../../../component/config/utils/variable";
import stores from "../../../../store/stores";
import { dashboard } from "../../../../config/utils/routes";
import { useRouter } from "next/navigation";
import { WEBSITE_TITLE } from "../../../../config/utils/variables";

const SidebarLogo: React.FC = observer(() => {
  const router = useRouter();
  const {
    layout: { isCallapse },
    themeStore: { themeConfig },
  } = stores;

  const bg = useColorModeValue(
    themeConfig.colors.custom.light.primary,
    themeConfig.colors.custom.dark.primary
  );

  return (
    <Flex
      bgColor={bg}
      justifyContent={isCallapse ? "center" : "flex-start"}
      flexDirection={isCallapse ? "column" : "row"}
      alignItems="center"
      height={headerHeight}
      px={isCallapse ? 0 : 3}
      transition="all 0.3s ease-in-out"
      borderBottom="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
    >
      <Box
        cursor="pointer"
        display="flex"
        alignItems="center"
        justifyContent="center"
        onClick={() => router.push(dashboard.home)}
      >
        {isCallapse ? (
          <Text
            fontWeight="bold"
            fontSize="xl"
            color={useColorModeValue("gray.800", "gray.100")}
            letterSpacing="wide"
          >
            {`${WEBSITE_TITLE?.charAt(0).toUpperCase()}.${WEBSITE_TITLE?.slice(
              -1
            ).toUpperCase()}`}
          </Text>
        ) : (
          <Flex alignItems="center" columnGap={3} maxW="100%">
            {/* Company Logo */}
            <Box
              position="relative"
              width="40px"
              height="40px"
              borderRadius="full"
              overflow="hidden"
              bg={useColorModeValue("white", "gray.800")}
              boxShadow="sm"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <NextImage
                src="/images/whiteLogo.png"
                alt={WEBSITE_TITLE}
                fill
                style={{ objectFit: "contain" }}
              />
            </Box>

            {/* Company Name with Tooltip */}
            <Tooltip
              label={WEBSITE_TITLE}
              hasArrow
              placement="right"
              bg={useColorModeValue("gray.700", "gray.900")}
              color="white"
              px={3}
              py={1}
              borderRadius="md"
              fontSize="sm"
              openDelay={200}
            >
              <Text
                textAlign="center"
                fontSize="lg"
                fontWeight="bold"
                noOfLines={1}
                isTruncated
                color={useColorModeValue("gray.800", "gray.100")}
                _hover={{ color: useColorModeValue("red.600", "red.300") }}
                transition="color 0.2s ease-in-out"
              >
                {WEBSITE_TITLE}
              </Text>
            </Tooltip>
          </Flex>
        )}
      </Box>
    </Flex>
  );
});

export default SidebarLogo;
