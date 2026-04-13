"use client";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useRef } from "react";

const DeleteData = ({ isOpen, onClose, handleDeleteData, data, loading }: any) => {
  const cancelRef: any = useRef(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Lab Doctor
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete <b>{data?.labDoctorName}</b>? This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isDisabled={loading}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={() => handleDeleteData(false)} ml={3} isLoading={loading}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteData;
