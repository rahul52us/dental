import fs from 'fs';
import path from 'path';

const pages = [
  {
    folder: 'work-done',
    name: 'WorkDoneTable',
    title: 'Work Done (Old Data)'
  },
  {
    folder: 'tooth-work',
    name: 'ToothWorkTable',
    title: 'Tooth Work (Old Data)'
  },
  {
    folder: 'transactions',
    name: 'TransactionsTable',
    title: 'Transactions (Old Data)'
  },
  {
    folder: 'fees',
    name: 'FeesTable',
    title: 'Fees (Old Data)'
  }
];

const basePath = 'd:\\personal\\dental\\dental-frontend\\app\\dashboard\\old-data';

for (const page of pages) {
  const pageTsxContent = `"use client";
import React from "react";
import ${page.name} from "./component/${page.name}";

const Page = () => {
  return <${page.name} />;
};

export default Page;
`;

  const componentTsxContent = `"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../../../../store/stores";
import {
  Box,
  Heading,
  HStack,
  Input,
  Button,
  Spinner,
  Text,
  Badge,
  Flex,
  InputGroup,
  InputLeftElement,
  useColorModeValue
} from "@chakra-ui/react";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import CustomTable from "../../../../component/config/component/CustomTable/CustomTable";
import DashPageHeader from "../../../../component/common/DashPageHeader/DashPageHeader";
import DashPageTitle from "../../../../component/common/DashPageTitle/DashPageTitle";

const ${page.name} = observer(() => {
  const { oldDataStore } = stores;
  const [searchQuery, setSearchQuery] = useState("");
  
  const bg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    fetchData();
  }, [oldDataStore.${page.folder === 'work-done' ? 'workCompPage' : page.folder === 'tooth-work' ? 'toothWorkPage' : page.folder === 'transactions' ? 'transactionPage' : 'workFeePage'}]);

  const fetchData = () => {
    ${
      page.folder === 'work-done' ? 'oldDataStore.fetchWorkComps();' :
      page.folder === 'tooth-work' ? 'oldDataStore.fetchToothWork();' :
      page.folder === 'transactions' ? 'oldDataStore.fetchTransactions();' :
      'oldDataStore.fetchWorkFees();'
    }
  };

  const handleSearch = () => {
    ${
      page.folder === 'work-done' ? 'oldDataStore.setWorkCompSearch(searchQuery);' :
      page.folder === 'tooth-work' ? 'oldDataStore.setToothWorkSearch(searchQuery);' :
      page.folder === 'transactions' ? 'oldDataStore.setTransactionSearch(searchQuery);' :
      'oldDataStore.setWorkFeeSearch(searchQuery);'
    }
    fetchData();
  };

  const handlePageChange = (page: number) => {
    ${
      page.folder === 'work-done' ? 'oldDataStore.setWorkCompPage(page);' :
      page.folder === 'tooth-work' ? 'oldDataStore.setToothWorkPage(page);' :
      page.folder === 'transactions' ? 'oldDataStore.setTransactionPage(page);' :
      'oldDataStore.setWorkFeePage(page);'
    }
  };

  ${
    page.folder === 'work-done' ? `
  const columns = [
    { header: "Date", accessor: (row: any) => new Date(row.wrk_date).toLocaleDateString() },
    { header: "Patient Code", accessor: "legacyPatCode" },
    { header: "Patient Name", accessor: (row: any) => row.patientId?.name || "Unknown" },
    { header: "Doctor Code", accessor: (row: any) => row.legacyDocCode || row.doctorId?.name },
    { header: "Fee Due", accessor: "fee_due" },
    { header: "Fee Dis", accessor: "fee_dis" },
    { header: "Stage", accessor: (row: any) => <Badge colorScheme="blue">{row.treat_stage}</Badge> },
  ];
  const data = oldDataStore.workComp;
  const total = oldDataStore.workCompTotal;
  const currentPage = oldDataStore.workCompPage;
    ` :
    page.folder === 'tooth-work' ? `
  const columns = [
    { header: "Date", accessor: (row: any) => new Date(row.wrkdate).toLocaleDateString() },
    { header: "Patient Code", accessor: "legacyPatCode" },
    { header: "Patient Name", accessor: (row: any) => row.patientId?.name || "Unknown" },
    { header: "Doctor Code", accessor: (row: any) => row.legacyDocCode || row.doctorId?.name },
    { header: "Treatment Name", accessor: "name" },
    { header: "Description", accessor: "descript" },
    { header: "Tooth No", accessor: "ToothNoS" },
  ];
  const data = oldDataStore.toothWork;
  const total = oldDataStore.toothWorkTotal;
  const currentPage = oldDataStore.toothWorkPage;
    ` :
    page.folder === 'transactions' ? `
  const columns = [
    { header: "Date", accessor: (row: any) => new Date(row.date).toLocaleDateString() },
    { header: "Work Date", accessor: (row: any) => new Date(row.wrk_date).toLocaleDateString() },
    { header: "Patient Code", accessor: "legacyPatCode" },
    { header: "Patient Name", accessor: (row: any) => row.patientId?.name || "Unknown" },
    { header: "Doctor", accessor: "doctor" },
    { header: "Fee Received", accessor: (row: any) => <Text fontWeight="bold" color="green.500">₹{row.fee_rec}</Text> },
  ];
  const data = oldDataStore.transactions;
  const total = oldDataStore.transactionTotal;
  const currentPage = oldDataStore.transactionPage;
    ` :
    `
  const columns = [
    { header: "Work Date", accessor: (row: any) => new Date(row.wrk_date).toLocaleDateString() },
    { header: "Patient Code", accessor: "legacyPatCode" },
    { header: "Patient Name", accessor: (row: any) => row.patientId?.name || "Unknown" },
    { header: "Doctor Code", accessor: "Doc_Code" },
    { header: "Fee Due", accessor: "fee_due" },
    { header: "Fee Dis", accessor: "fee_dis" },
    { header: "Stage", accessor: (row: any) => <Badge colorScheme="purple">{row.treat_stage}</Badge> },
  ];
  const data = oldDataStore.workFees;
  const total = oldDataStore.workFeeTotal;
  const currentPage = oldDataStore.workFeePage;
    `
  }

  return (
    <Box bg={bg} minH="100vh" p={4}>
      <DashPageHeader>
        <DashPageTitle title="${page.title}" />
        <HStack>
          <InputGroup w="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search by Patient Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              bg="white"
            />
          </InputGroup>
          <Button colorScheme="blue" leftIcon={<FiSearch />} onClick={handleSearch}>
            Search
          </Button>
          <Button leftIcon={<FiRefreshCw />} onClick={fetchData} variant="outline">
            Refresh
          </Button>
        </HStack>
      </DashPageHeader>

      <Box mt={6} bg="white" rounded="lg" shadow="sm" overflow="hidden">
        {oldDataStore.loading ? (
          <Flex justify="center" align="center" h="400px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <CustomTable
            columns={columns}
            data={data}
            totalItems={total}
            itemsPerPage={20}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </Box>
    </Box>
  );
});

export default ${page.name};
`;

  fs.writeFileSync(path.join(basePath, page.folder, 'page.tsx'), pageTsxContent);
  fs.writeFileSync(path.join(basePath, page.folder, 'component', \`\${page.name}.tsx\`), componentTsxContent);
}
