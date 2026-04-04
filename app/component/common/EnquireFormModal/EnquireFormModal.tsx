import React from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalCloseButton,
    Box,
    Text,
} from "@chakra-ui/react";
import ContactDetailedForm from "../../ContactUsFormSection/element/ContactDetailedForm";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";

interface EnquireFormModalProps {
    handleFormSubmit?: any;
    isOpen: boolean;
    onClose: () => void;
    pageLink?: string
}

const EnquireFormModal: React.FC<EnquireFormModalProps> = observer(({
    isOpen,
    onClose,
    handleFormSubmit,
    pageLink
}) => {
    const { themeStore: { themeConfig } } = stores;
    const onFormSubmit = (formData) => {
        if (handleFormSubmit) {
            handleFormSubmit(formData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent borderRadius="lg" overflow="hidden">
                <ModalHeader bg={themeConfig.colors.custom.light.primary} color="white" py={4} textAlign="center" fontSize="xl" fontWeight="bold">
                    Get Started
                </ModalHeader>
                <ModalCloseButton color="white" />
                <Box p={5}>
                    <ContactDetailedForm 
                        handleFormSubmit={onFormSubmit} 
                        links={pageLink || "assessment"} 
                        showHeader={false} 
                        isEquiry={true}
                    />
                </Box>
            </ModalContent>
        </Modal>
    );
});

export default EnquireFormModal;