import { useState } from "react";
// import { ToothData, DentitionType } from "@/data/teethData";
// import { Header } from "@/components/Header";
// import { TeethChart } from "@/components/TeethChart";
// import { DentitionToggle } from "@/components/DentitionToggle";
// import { ToothFormDialog } from "@/components/ToothFormDialog";
// import { ToothInfoCard } from "@/components/ToothInfoCard";

import {
    Box,
    Button,
    Container,
    Flex,
    Grid,
    Heading,
    Text,
    VStack
} from "@chakra-ui/react";
import { FiFileText } from "react-icons/fi";
import { DentitionToggle } from "./component/DentitionToggle";
import { TeethChart } from "./component/TeethChart";
import { ToothFormDialog } from "./component/ToothFormDialog";
import { ToothInfoCard } from "./component/ToothInfoCard";
import { DentitionType, ToothData } from "./utils/teethData";

const Index = () => {
  const [dentitionType, setDentitionType] =
    useState<DentitionType>("adult");
  const [selectedTooth, setSelectedTooth] =
    useState<ToothData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToothClick = (tooth: ToothData) => {
    setSelectedTooth(tooth);
  };

  const handleOpenTreatmentForm = () => {
    if (selectedTooth) {
      setDialogOpen(true);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* <ChartHeader /> */}

      <Container maxW="7xl" mx={'auto'} py={8}>
        <VStack spacing={8} align="stretch">
          {/* Page Title */}
          <VStack spacing={2} textAlign="center">
            <Heading size="lg">Dental Chart</Heading>
            <Text color="gray.600">
              Select a tooth to view details or add a treatment plan
            </Text>
          </VStack>

          {/* Dentition Toggle */}
          <Flex justify="center">
            <DentitionToggle
              value={dentitionType}
              onChange={setDentitionType}
            />
          </Flex>

          {/* Main Content */}
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 300px" }}
            gap={6}
          >
            {/* Teeth Chart */}
            <Box order={{ base: 2, lg: 1 }}>
              <TeethChart
                dentitionType={dentitionType}
                selectedTooth={selectedTooth}
                onToothClick={handleToothClick}
              />
            </Box>

            {/* Sidebar */}
            <VStack
              order={{ base: 1, lg: 2 }}
              spacing={4}
              align="stretch"
            >
              <ToothInfoCard tooth={selectedTooth} />

              {selectedTooth && (
                <Button
                  size="lg"
                  width="100%"
                  leftIcon={<FiFileText />}
                  onClick={handleOpenTreatmentForm}
                >
                  Add Treatment Plan
                </Button>
              )}
            </VStack>
          </Grid>

          {/* Nomenclature Info */}
       
        </VStack>
      </Container>

      {/* Treatment Form Dialog */}
      <ToothFormDialog
        tooth={selectedTooth}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Box>
  );
};

export default Index;
