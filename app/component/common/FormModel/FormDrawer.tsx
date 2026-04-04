import {
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    useColorModeValue,
    Flex,
    Text,
    Box,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";

interface FormDrawerProps {
    open: boolean;
    close: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    size?: string;
    [key: string]: any;
}

const FormDrawer = observer(({
    open,
    close,
    title,
    children,
    size,
    ...rest
}: FormDrawerProps) => {
    const { themeStore: { themeConfig } } = stores;
    const headerBg = useColorModeValue(themeConfig.colors.custom.light.primary, "gray.800");
    const headerTextColor = "white";
    const borderColor = useColorModeValue("gray.100", "gray.700");

    return (
        <Drawer
            isOpen={open}
            placement="right"
            onClose={close}
            size={size || "lg"}
            {...rest}
        >
            <DrawerOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
            <DrawerContent
                boxShadow="-10px 0 30px rgba(0,0,0,0.1)"
                borderLeft="1px solid"
                borderColor={borderColor}
            >
                {title && (
                    <DrawerHeader
                        borderBottomWidth='1px'
                        borderColor={borderColor}
                        bg={headerBg}
                        p={6}
                    >
                        <Flex justify="space-between" align="center">
                            <Box>{title}</Box>
                            <DrawerCloseButton
                                position="static"
                                size="lg"
                                borderRadius="full"
                                _hover={{ bg: "gray.100" }}
                                transition="all 0.2s"
                            />
                        </Flex>
                    </DrawerHeader>
                )}

                <DrawerBody p={0} bg={useColorModeValue("white", "gray.800")}>
                    {children}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
});

export default FormDrawer;
