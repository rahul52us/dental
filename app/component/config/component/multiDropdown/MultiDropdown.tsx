'use client'
import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  VStack,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { debounce } from "lodash";
import { MdFilterList } from "react-icons/md";
import CustomDateRange from "../CustomDateRange/CustomDateRange";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
const CustomInput = dynamic(() => import('../../../../component/config/component/customInput/CustomInput'), { ssr: false });

interface DropdownOption {
  value: string;
  label: string;
}

interface Dropdown {
  label: string;
  options: DropdownOption[];
  placeholder?: string;
}

interface MultiDropdownProps {
  search?: any;
  title?: string;
  dropdowns: Dropdown[];
  selectedOptions: any;
  onDropdownChange: any;
  onApply: () => void;
  resetFilters?: any;
  minH?: any;
  actions: any;
}

const MultiDropdown = ({
  search,
  dropdowns,
  selectedOptions,
  onDropdownChange,
  onApply,
  resetFilters,
  actions,
}: MultiDropdownProps) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(search?.searchValue || "");
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  // Use useColorModeValue to set colors for light and dark modes
  const popoverBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const buttonTextColor = useColorModeValue("teal.400", "teal.200");
  const focusBorderColor = useColorModeValue("blue.500", "blue.300");

  useEffect(() => {
    const debouncedHandler = debounce((value: string) => {
      if (search?.onSearchChange) {
        search?.onSearchChange(value);
      }
    }, 1000);

    const timeoutId = setTimeout(() => {
      debouncedHandler(inputValue);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [inputValue, search]);

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
    },
    [setInputValue]
  );

  const resetFilterss = () => {
    resetFilters();
    setInputValue("");
  };

  return (
    <Popover
      isOpen={isPopoverOpen}
      onClose={handlePopoverClose}
      placement="bottom-start"
    >
      <PopoverTrigger>
        <Button
          aria-label=""
          fontSize="md"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          color={buttonTextColor}
          size="md"
          leftIcon={<MdFilterList />}
        >
          {t("common.table.filter")}
        </Button>
      </PopoverTrigger>
      <PopoverContent p={3} bg={popoverBg} borderColor={borderColor} boxShadow="md">
        <PopoverHeader
          mt={-1}
          fontWeight="bold"
          borderBottomWidth="1px"
          color={buttonTextColor}
        >
          {t("common.table.selectOptions")}
        </PopoverHeader>
        <PopoverBody>
          <VStack rowGap={2} align="stretch">
            {actions?.datePicker?.show && (
              <Flex
                justifyContent={"center"}
                display={{ base: "block", md: "none" }}
              >
                <CustomDateRange
                  isMobile={actions?.datePicker?.isMobile}
                  startDate={actions?.datePicker?.date.startDate}
                  endDate={actions?.datePicker?.date.endDate}
                  onStartDateChange={(e) => {
                    if (actions?.datePicker?.onDateChange) {
                      actions?.datePicker?.onDateChange(e, "startDate");
                    }
                  }}
                  onEndDateChange={(e) => {
                    if (actions?.datePicker?.onDateChange) {
                      actions?.datePicker?.onDateChange(e, "endDate");
                    }
                  }}
                />
              </Flex>
            )}
            {search && search?.visible && (
              <Input
                placeholder={search?.placeholder || t("common.table.search")}
                value={inputValue}
                onChange={handleInputChange}
                borderRadius="md"
                bg={popoverBg}
                borderColor={borderColor}
                _focus={{ borderColor: focusBorderColor, boxShadow: "outline" }}
              />
            )}
            {dropdowns.map((dropdown: Dropdown, index: number) => {
              return (
                <CustomInput
                  label={dropdown.label}
                  isClear
                  isSearchable={false}
                  name="select"
                  type="select"
                  isMulti={true}
                  key={index}
                  options={dropdown.options}
                  placeholder={dropdown.placeholder || t("common.table.selectOptions")}
                  value={selectedOptions[dropdown.label] || null}
                  onChange={(selected: any) => {
                    onDropdownChange(selected, dropdown.label);
                  }}
                />
              );
            })}
            <Button
              colorScheme="teal"
              onClick={() => {
                onApply();
                handlePopoverClose();
              }}
              mt={2}
            >
              {t("common.table.apply")}
            </Button>
            {resetFilters && (
              <Button
                variant="outline"
                mt={1}
                onClick={() => resetFilterss()}
                border="2px solid"
                colorScheme="red"
              >
                {t("common.table.resetFilter")}
              </Button>
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default MultiDropdown;
