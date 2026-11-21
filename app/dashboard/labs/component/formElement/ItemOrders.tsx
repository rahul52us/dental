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
  HStack,
  Flex,
  useColorModeValue,
  useBreakpointValue,
  SimpleGrid,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

interface Item {
  itemName: string;
  itemCode?: string;
  quantity: number | "";
  price: number | "";
  total: number | "";
  patientName: any;
}

interface ItemOrderingInputProps {
  values: { items: Item[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const ItemOrderingInput = ({
  values,
  setFieldValue,
  errors,
}: ItemOrderingInputProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const tableHeadBg = useColorModeValue("gray.100", "gray.700");
  const rowHoverBg = useColorModeValue("gray.50", "gray.700");
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const calculateTotal = (qty: number | "", price: number | "") => {
    if (qty && price) return Number(qty) * Number(price);
    return "";
  };

  const grandTotal = values.items.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );

  return (
    <GridItem colSpan={3}>
      <Box
        p={{ base: 3, md: 6 }}
        borderWidth={1}
        borderRadius="xl"
        boxShadow="lg"
        bg={cardBg}
        mt={3}
      >
        <Text fontWeight="bold" fontSize={{ base: "lg", md: "xl" }} mb={{ base: 4, md: 6 }}>
          Item Ordering & Pricing
        </Text>

        <FieldArray name="items">
          {({ remove, push }) => (
            <>
              {isMobile ? (
                /* ============================================================== */
                /* MOBILE CARDS INTERFACE (< 768px)                               */
                /* ============================================================== */
                <VStack spacing={4} align="stretch">
                  {values.items.map((item, index) => (
                    <Box
                      key={index}
                      p={3.5}
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="xl"
                      bg="gray.50"
                      position="relative"
                    >
                      {/* Card Header */}
                      <Flex justify="space-between" align="center" mb={3}>
                        <Badge
                          bgGradient="linear(135deg, var(--chakra-colors-custom-dark-primary, #0EA5E9) 0%, var(--chakra-colors-custom-light-primary, #0D9488) 100%)"
                          color="white"
                          borderRadius="full"
                          px={2.5}
                          py={0.5}
                          fontSize="11px"
                          fontWeight="800"
                        >
                          Item #{index + 1}
                        </Badge>
                        <IconButton
                          aria-label="Remove item"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        />
                      </Flex>

                      {/* Patient Name */}
                      <Box mb={3}>
                        <Text fontSize="11px" fontWeight="700" color="gray.500" mb={1} textTransform="uppercase">
                          Patient Name
                        </Text>
                        <CustomInput
                          name={`items[${index}].patientName`}
                          placeholder="Search patient..."
                          type="real-time-user-search"
                          value={item.patientName}
                          onChange={(e: any) =>
                            setFieldValue(`items[${index}].patientName`, e)
                          }
                          error={errors?.items?.[index]?.patientName}
                          showError={errors?.items?.[index]?.patientName}
                          query={{ type: "patient" }}
                        />
                      </Box>

                      {/* Item Name */}
                      <Box mb={3}>
                        <Text fontSize="11px" fontWeight="700" color="gray.500" mb={1} textTransform="uppercase">
                          Item Name
                        </Text>
                        <CustomInput
                          name={`items[${index}].itemName`}
                          placeholder="Enter item name..."
                          value={item.itemName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(`items[${index}].itemName`, e.target.value)
                          }
                          error={errors?.items?.[index]?.itemName}
                          showError={errors?.items?.[index]?.itemName}
                        />
                      </Box>

                      {/* Item Code */}
                      <Box mb={3}>
                        <Text fontSize="11px" fontWeight="700" color="gray.500" mb={1} textTransform="uppercase">
                          Item Code / SKU
                        </Text>
                        <CustomInput
                          name={`items[${index}].itemCode`}
                          placeholder="Item code..."
                          value={item.itemCode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(`items[${index}].itemCode`, e.target.value)
                          }
                          error={errors?.items?.[index]?.itemCode}
                          showError={errors?.items?.[index]?.itemCode}
                        />
                      </Box>

                      {/* Quantity & Price */}
                      <SimpleGrid columns={2} spacing={3} mb={3}>
                        <Box>
                          <Text fontSize="11px" fontWeight="700" color="gray.500" mb={1} textTransform="uppercase">
                            Quantity
                          </Text>
                          <CustomInput
                            name={`items[${index}].quantity`}
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const qty = e.target.value ? parseInt(e.target.value) : "";
                              setFieldValue(`items[${index}].quantity`, qty);
                              setFieldValue(
                                `items[${index}].total`,
                                calculateTotal(qty, item.price)
                              );
                            }}
                            error={errors?.items?.[index]?.quantity}
                            showError={errors?.items?.[index]?.quantity}
                          />
                        </Box>
                        <Box>
                          <Text fontSize="11px" fontWeight="700" color="gray.500" mb={1} textTransform="uppercase">
                            Price (unit)
                          </Text>
                          <CustomInput
                            name={`items[${index}].price`}
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const price = e.target.value ? parseFloat(e.target.value) : "";
                              setFieldValue(`items[${index}].price`, price);
                              setFieldValue(
                                `items[${index}].total`,
                                calculateTotal(item.quantity, price)
                              );
                            }}
                            error={errors?.items?.[index]?.price}
                            showError={errors?.items?.[index]?.price}
                          />
                        </Box>
                      </SimpleGrid>

                      {/* Item Total Display */}
                      <Flex
                        justify="space-between"
                        align="center"
                        p={2.5}
                        bg={useColorModeValue("white", "whiteAlpha.100")}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                      >
                        <Text fontSize="xs" fontWeight="700" color={useColorModeValue("gray.600", "gray.300")}>
                          Total Amount:
                        </Text>
                        <Text fontSize="sm" fontWeight="800" color="teal.500">
                          ₹ {item.total || 0}
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              ) : (
                /* ============================================================== */
                /* DESKTOP TABLE (>= 768px)                                       */
                /* ============================================================== */
                <Table size="sm" variant="simple">
                  <Thead bg={tableHeadBg}>
                    <Tr>
                      <Th>Patient Name</Th>
                      <Th>Item Name</Th>
                      <Th>Item Code / SKU</Th>
                      <Th isNumeric>Quantity</Th>
                      <Th isNumeric>Price (per unit)</Th>
                      <Th isNumeric>Total</Th>
                      <Th textAlign="center">Actions</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {values.items.map((item, index) => (
                      <Tr key={index} _hover={{ bg: rowHoverBg }}>
                        <Td w={350}>
                          <CustomInput
                            name={`items[${index}].patientName`}
                            placeholder="Patient Name"
                            type="real-time-user-search"
                            value={item.patientName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setFieldValue(`items[${index}].patientName`, e)
                            }
                            error={errors?.items?.[index]?.itemName}
                            showError={errors?.items?.[index]?.itemName}
                            query={{ type: "patient" }}
                          />
                        </Td>
                        <Td w={220}>
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
                            error={errors?.items?.[index]?.itemCode}
                            showError={errors?.items?.[index]?.itemCode}
                          />
                        </Td>

                        <Td isNumeric>
                          <CustomInput
                            name={`items[${index}].quantity`}
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const qty = e.target.value ? parseInt(e.target.value) : "";
                              setFieldValue(`items[${index}].quantity`, qty);
                              setFieldValue(
                                `items[${index}].total`,
                                calculateTotal(qty, item.price)
                              );
                            }}
                            error={errors?.items?.[index]?.quantity}
                            showError={errors?.items?.[index]?.quantity}
                          />
                        </Td>

                        <Td isNumeric>
                          <CustomInput
                            name={`items[${index}].price`}
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const price = e.target.value ? parseFloat(e.target.value) : "";
                              setFieldValue(`items[${index}].price`, price);
                              setFieldValue(
                                `items[${index}].total`,
                                calculateTotal(item.quantity, price)
                              );
                            }}
                            error={errors?.items?.[index]?.price}
                            showError={errors?.items?.[index]?.price}
                          />
                        </Td>

                        <Td isNumeric>
                          <CustomInput
                            name={`items[${index}].total`}
                            type="number"
                            value={item.total}
                          />
                        </Td>

                        <Td textAlign="center">
                          <IconButton
                            aria-label="Remove item"
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            size="sm"
                            onClick={() => remove(index)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}

              {/* Add Item Button */}
              <Button
                leftIcon={<AddIcon />}
                mt={4}
                colorScheme="teal"
                onClick={() =>
                  push({
                    patientName: undefined,
                    itemName: "",
                    itemCode: "",
                    quantity: "",
                    price: "",
                    total: "",
                    add: 1,
                  })
                }
              >
                Add Item
              </Button>

              {/* Grand Total */}
              <Flex justify="flex-end" mt={6}>
                <HStack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg">
                    Grand Total:
                  </Text>
                  <Text fontWeight="bold" fontSize="lg" color="teal.600">
                    ₹ {grandTotal.toFixed(2)}
                  </Text>
                </HStack>
              </Flex>
            </>
          )}
        </FieldArray>
      </Box>
    </GridItem>
  );
};

export default ItemOrderingInput;
