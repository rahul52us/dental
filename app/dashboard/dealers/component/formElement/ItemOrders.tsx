import React from "react";
import {
  Box,
  Button,
  IconButton,
  Text,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Badge,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import { FieldArray } from "formik";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface Item {
  itemName: string;
  itemCode?: string;
  quantity: number | "";
  price: number | "";
  total: number | "";
  brandName: string;
}

interface ItemOrderingInputProps {
  values: { items: Item[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const ItemOrderingInput = observer(({
  values,
  setFieldValue,
  errors,
}: ItemOrderingInputProps) => {
  const bgBox = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("brand.200", "gray.700");
  const theadBg = useColorModeValue("gray.50", "gray.700");
  const rowHoverBg = useColorModeValue("blue.50", "whiteAlpha.50");

  const calculateTotal = (qty: number | "", price: number | "") => {
    if (qty && price) return Number(qty) * Number(price);
    return "";
  };

  const grandTotal = values.items.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );

  return (
    <GridItem colSpan={2}>
      <Flex align="center" mb={4} gap={2}>
        <Text fontSize="lg" fontWeight="bold" color="gray.700">
          Order Items Catalog
        </Text>
        <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2}>
          {values.items.length} Items
        </Badge>
      </Flex>
      <Box
        p={6}
        borderWidth={1}
        borderRadius="2xl"
        boxShadow="xl"
        bg={bgBox}
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="3px"
          bg={stores.themeStore.themeConfig.colors.custom.light.primary}
        />
        
        <FieldArray name="items">
          {({ remove, push }) => (
            <>
              <Box overflowX="auto" borderRadius="lg" border="1px solid" borderColor="gray.100">
                <Table size="sm" variant="simple">
                  <Thead bg={theadBg}>
                    <Tr>
                      <Th pt={4} pb={4} fontSize="xs" fontWeight="black" color="gray.500">BRAND</Th>
                      <Th pt={4} pb={4} fontSize="xs" fontWeight="black" color="gray.500">ITEM DESCRIPTION</Th>
                      <Th pt={4} pb={4} fontSize="xs" fontWeight="black" color="gray.500">CODE</Th>
                      <Th pt={4} pb={4} isNumeric fontSize="xs" fontWeight="black" color="gray.500">QTY</Th>
                      <Th pt={4} pb={4} isNumeric fontSize="xs" fontWeight="black" color="gray.500">PRICE</Th>
                      <Th pt={4} pb={4} isNumeric fontSize="xs" fontWeight="black" color="gray.500">TOTAL</Th>
                      <Th pt={4} pb={4} textAlign="center">ACTION</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {values.items.map((item, index) => (
                      <Tr 
                        key={index} 
                        _hover={{ bg: rowHoverBg }} 
                        transition="all 0.2s"
                      >
                        <Td py={3}>
                          <CustomInput
                            name={`items[${index}].brandName`}
                            placeholder="Brand Name"
                            value={item.brandName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setFieldValue(`items[${index}].brandName`, e.target.value)
                            }
                            error={errors?.items?.[index]?.brandName}
                            showError={errors?.items?.[index]?.brandName}
                          />
                        </Td>
                        <Td>
                          <CustomInput
                            name={`items[${index}].itemName`}
                            placeholder="Item Name"
                            value={item.itemName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setFieldValue(`items[${index}].itemName`, e.target.value)
                            }
                            error={errors?.items?.[index]?.itemName}
                            showError={errors?.items?.[index]?.itemName}
                          />
                        </Td>
                        <Td>
                          <CustomInput
                            name={`items[${index}].itemCode`}
                            placeholder="Code"
                            value={item.itemCode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setFieldValue(`items[${index}].itemCode`, e.target.value)
                            }
                          />
                        </Td>
                        <Td isNumeric w="80px">
                          <CustomInput
                            name={`items[${index}].quantity`}
                            type="number"
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const qty = e.target.value ? parseInt(e.target.value) : "";
                              setFieldValue(`items[${index}].quantity`, qty);
                              setFieldValue(`items[${index}].total`, calculateTotal(qty, item.price));
                            }}
                          />
                        </Td>
                        <Td isNumeric w="100px">
                          <CustomInput
                            name={`items[${index}].price`}
                            type="number"
                            value={item.price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const price = e.target.value ? parseFloat(e.target.value) : "";
                              setFieldValue(`items[${index}].price`, price);
                              setFieldValue(`items[${index}].total`, calculateTotal(item.quantity, price));
                            }}
                          />
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="black" color={stores.themeStore.themeConfig.colors.custom.light.primary}>
                            ₹{item.total || 0}
                          </Text>
                        </Td>
                        <Td textAlign="center">
                          <IconButton
                            aria-label="Remove item"
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            borderRadius="full"
                            onClick={() => remove(index)}
                            _hover={{ bg: "red.50" }}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <Flex justify="space-between" align="center" mt={6}>
                <MotionButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  leftIcon={<AddIcon />}
                  bg={stores.themeStore.themeConfig.colors.custom.light.primary}
                  color="white"
                  shadow="md"
                  _hover={{ shadow: "lg", filter: "brightness(0.9)" }}
                  size="md"
                  borderRadius="xl"
                  px={8}
                  onClick={() => push({
                    brandName: "",
                    itemName: "",
                    itemCode: "",
                    quantity: "",
                    price: "",
                    total: "",
                    add: 1
                  })}
                >
                  Add Portfolio Item
                </MotionButton>

                <MotionBox
                  p={4}
                  borderRadius="2xl"
                  bg={stores.themeStore.themeConfig.colors.custom.light.primary}
                  color="white"
                  shadow="2xl"
                  minW="220px"
                  textAlign="center"
                  position="relative"
                  overflow="hidden"
                >
                  <Box 
                    position="absolute" 
                    top="-20%" 
                    right="-10%" 
                    w="100px" 
                    h="100px" 
                    bg="whiteAlpha.100" 
                    borderRadius="full" 
                  />
                  <Text fontSize="xs" opacity={0.8} mb={1} fontWeight="bold" letterSpacing="widest" textTransform="uppercase">
                    Estimated Total
                  </Text>
                  <Text fontSize="2xl" fontWeight="black">
                    ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </MotionBox>
              </Flex>
            </>
          )}
        </FieldArray>
      </Box>
    </GridItem>
  );
});

export default ItemOrderingInput;