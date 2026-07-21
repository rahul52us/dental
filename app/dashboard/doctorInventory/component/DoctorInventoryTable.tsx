"use client";
import {
  Box,
  Badge,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import CustomTable from "../../../component/config/component/CustomTable/CustomTable";
import { tablePageLimit } from "../../../component/config/utils/variable";
import stores from "../../../store/stores";
import moment from "moment";

const DoctorInventoryTable = observer(({ onAdd, onEdit, onDelete }: any) => {
  const {
    doctorInventoryStore: { doctorInventories, getDoctorInventories },
  } = stores;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getDoctorInventories({ page, limit: tablePageLimit, search });
  }, [page, search, getDoctorInventories]);

  const handleChangePage = (p: number) => {
    setPage(p);
  };

  const columns = [
    {
      headerName: "Lab Doctor",
      key: "labDoctor",
      type: "component",
      metaData: {
        component: (item: any) => (
          <Badge
            colorScheme={"blue"}
            variant="solid"
            borderRadius="full"
            fontSize="sm"
            fontWeight="semibold"
          >
            {item.labDoctor?.labDoctorName || "Unknown"}
          </Badge>
        ),
      },
    },
    {
      headerName: "Description",
      key: "description",
    },
    {
      headerName: "Date",
      key: "createdAt",
      type: "component",
      metaData: {
        component: (item: any) => (
          <span>{moment(item.createdAt).format("DD MMM YYYY, hh:mm A")}</span>
        )
      }
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
        title="In & Out Ledger"
        columns={columns}
        data={doctorInventories.data || []}
        loading={doctorInventories.loading}
        actions={{
          actionBtn: {
            addKey: {
              showAddButton: stores.auth.hasPermission('doctorInventory', 'create'),
              function: () => onAdd(),
            },
            editKey: {
              showEditButton: stores.auth.hasPermission('doctorInventory', 'edit'),
              function: (row: any) => onEdit(row),
            },
            deleteKey: {
              showDeleteButton: stores.auth.hasPermission('doctorInventory', 'delete'),
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
            totalPages: doctorInventories.TotalPages || 1,
          },
        }}
      />
    </Box>
  );
});

export default DoctorInventoryTable;
