"use client";
import {
  Badge,
  Box,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../component/config/utils/variable";
import stores from "../../../store/stores";

const LabDoctorTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const {
    labDoctorStore: { labDoctors, getLabDoctors },
  } = stores;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getLabDoctors({ page, limit: tablePageLimit, search });
  }, [page, search, getLabDoctors]);

  const handleChangePage = (p: number) => {
    setPage(p);
  };

  const columns = [
    {
      headerName: "Name",
      key: "gender",
      type: "component",
      metaData: {
        component: (doctor: any) => {
          const colorScheme =
            doctor.gender === 1
              ? "blue"
              : doctor.gender === 2
                ? "pink"
                : "gray";

          return (
            <Badge
              colorScheme={colorScheme}
              variant="solid"
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
            >
              {doctor.labDoctorName}
            </Badge>
          );
        },
      },
    },
    {
      headerName: "Email / Mobile",
      key: "email",
      type: "component",
      metaData: {
        component: (doctor: any) => (
          <VStack spacing={0}>
            <Text fontSize="sm">{doctor.email}</Text>
            <Text fontSize="xs" color="gray.500">{doctor.mobileNumber}</Text>
          </VStack>
        ),
      },
    },
    {
      headerName: "Languages",
      key: "languages",
      type: "component",
      metaData: {
        component: (doctor: any) => (
          <HStack>
            {doctor.languages?.map((lang: string) => (
              <Badge key={lang} variant="outline" size="sm" textTransform="capitalize">
                {lang}
              </Badge>
            ))}
          </HStack>
        ),
      },
    },
    {
      headerName: "Address",
      key: "address",
      // props: { row: { isTruncated: true, maxW: "200px" } },
    },
    {
      headerName: "Actions",
      key: "table-actions",
      type: "table-actions",
      props: { row: { textAlign: "right" } },
    },
  ];

  return (
    <Box>
      <CustomTable
        title="Lab Doctors"
        columns={columns}
        data={labDoctors.data || []}
        loading={labDoctors.loading}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton: true,
              function: () => onAdd(),
            },
            editKey: {
              showEditButton: true,
              function: (row: any) => onEdit(row),
            },
            deleteKey: {
              showDeleteButton: true,
              function: (row: any) => onDelete(row),
            },
          },
          search: {
            show: true,
            searchValue: search,
            onSearchChange: (e: any) => {
              setSearch(e.target.value);
              setPage(1);
            },
          },
          pagination: {
            show: true,
            onClick: handleChangePage,
            currentPage: page,
            totalPages: labDoctors.TotalPages || 1,
          },
        }}
      />
    </Box>
  );
});

export default LabDoctorTable;
