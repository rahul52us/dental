import {
    Box,
    HStack,
    VStack,
    Text,
    Badge,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorModeValue,
    Tooltip,
    Circle,
} from "@chakra-ui/react";
import { FiMoreVertical, FiEdit3, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { formatDate } from "../../../../config/utils/dateUtils";
import { adultTeeth, childTeeth } from "../utils/teethData";

interface SavedTreatmentListItemProps {
    item: any;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
    onComplete: (id: string) => void;
}

export const SavedTreatmentListItem = ({ item, onEdit, onDelete, onComplete }: SavedTreatmentListItemProps) => {
    const bg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.100", "gray.700");

    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
                return { colorScheme: "green", label: "COMPLETED" };
            case "pending":
            case "planned":
                return { colorScheme: "gray", label: "PLANNED" };
            case "in-progress":
                return { colorScheme: "yellow", label: "IN-PROGRESS" };
            case "cancelled":
                return { colorScheme: "red", label: "CANCELLED" };
            default:
                return { colorScheme: "blue", label: status?.toUpperCase() || "UNKNOWN" };
        }
    };

    const statusStyle = getStatusStyles(item.status);
    const toothVal = typeof item.tooth === 'object' ? item.tooth.fdi : item.tooth;
    const isChild = item.dentitionType === "child" || (toothVal && parseInt(toothVal) >= 51 && parseInt(toothVal) <= 85);
    const toothData = toothVal ? (isChild ? childTeeth : adultTeeth).find(t => t.id === toothVal) : null;
    
    const toothInfo = toothVal ? `${(item.toothNotation || "FDI").toUpperCase()} ${toothVal}` : "General";
    const toothName = toothData?.name || (toothVal === "General" ? "General Clinical" : "");

    return (
        <Box
            p={3}
            bg={bg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            position="relative"
            transition="all 0.2s"
            _hover={{
                borderColor: "blue.200",
                shadow: "sm",
                transform: "translateX(2px)"
            }}
        >
            <HStack justify="space-between" align="start" spacing={3}>
                <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2}>
                        <Badge size="sm" variant="subtle" colorScheme="blue" borderRadius="full" px={2} fontSize="9px">
                            {toothInfo}
                        </Badge>
                        <Text fontSize="10px" fontWeight="1000" color="blue.600" noOfLines={1} maxW="150px">
                            {toothName}
                        </Text>
                        <Text fontSize="10px" color="gray.400" fontWeight="700">
                            • {formatDate(item.treatmentDate)}
                        </Text>
                    </HStack>
                    
                    <Text fontSize="xs" fontWeight="900" color="gray.700" noOfLines={1}>
                        {(item.treatmentPlan || "No Procedure").split(" → ").pop()}
                    </Text>
                    
                    <HStack spacing={2} pt={1}>
                        <Badge colorScheme={statusStyle.colorScheme} fontSize="8px" borderRadius="full" px={2}>
                            {statusStyle.label}
                        </Badge>
                        {item.doctorName && (
                            <Text fontSize="9px" color="gray.500" fontWeight="600">
                                Dr. {item.doctorName.split(" ").pop()}
                            </Text>
                        )}
                    </HStack>
                </VStack>

                <HStack spacing={1}>
                    {item.status?.toLowerCase() !== "completed" && (
                        <Tooltip label="Mark as Complete" placement="top">
                            <IconButton
                                aria-label="Mark as Complete"
                                icon={<FiCheckCircle />}
                                size="xs"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => onComplete(item._id)}
                            />
                        </Tooltip>
                    )}
                    <Menu isLazy>
                        <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="xs"
                            borderRadius="full"
                        />
                        <MenuList borderRadius="xl" shadow="xl" border="none" p={1}>
                            <MenuItem 
                                icon={<FiEdit3 />} 
                                onClick={() => onEdit(item)}
                                fontSize="xs"
                                fontWeight="600"
                                borderRadius="lg"
                            >
                                Edit Record
                            </MenuItem>
                            <MenuItem 
                                icon={<FiTrash2 />} 
                                color="red.500" 
                                onClick={() => onDelete(item._id)}
                                fontSize="xs"
                                fontWeight="600"
                                borderRadius="lg"
                            >
                                Delete Record
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </HStack>

            {item.notes && (
                <Box mt={2} pt={2} borderTop="1px dashed" borderColor="gray.50">
                    <Text fontSize="10px" color="gray.500" fontStyle="italic" noOfLines={1}>
                        {item.notes}
                    </Text>
                </Box>
            )}
        </Box>
    );
};
