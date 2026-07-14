'use client'
import ReactPaginate from "react-paginate";
import { Box, Flex, IconButton, useColorMode, useBreakpointValue } from "@chakra-ui/react";
import { MdFirstPage, MdLastPage, MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import "./pagination.css";

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  onPageChange: any;
  props?: any;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  props,
}: PaginationProps) => {
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handlePageChange = (selectedItem: { selected: number }) => {
    onPageChange(selectedItem.selected + 1);
  };

  return totalPages ? (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      mb={2}
      {...props}
    >
      <Flex alignItems="center" gridColumnGap="5px">
        <IconButton
          aria-label="First page"
          icon={<MdFirstPage size={20} />}
          onClick={() => onPageChange(1)}
          isDisabled={currentPage === 1}
          color={colorMode === "light" ? "gray.600" : "whiteAlpha.700"}
          variant="ghost"
          size="sm"
          _hover={{ bg: "teal.50", color: "teal.600" }}
          _disabled={{ color: colorMode === "light" ? "gray.400" : "whiteAlpha.400", bg: "transparent" }}
          display={{ base: "none", md: "flex" }}
        />
        <ReactPaginate
          previousLabel={<MdNavigateBefore />}
          nextLabel={<MdNavigateNext />}
          breakLabel="..."
          pageCount={totalPages}
          forcePage={currentPage - 1}
          onPageChange={handlePageChange}
          containerClassName="pagination"
          previousLinkClassName={`paginationLink ${currentPage === 1 ? 'paginationDisabled' : ''}`}
          nextLinkClassName={`paginationLink ${currentPage === totalPages ? 'paginationDisabled' : ''}`}
          disabledClassName="paginationDisabled"
          activeClassName="paginationActive"
          pageClassName="paginationItem"
          pageLinkClassName="paginationLink"
          pageRangeDisplayed={isMobile ? 1 : 5}
          marginPagesDisplayed={1}
        />
        <IconButton
          aria-label="Last page"
          icon={<MdLastPage size={20} />}
          onClick={() => onPageChange(totalPages)}
          isDisabled={currentPage === totalPages}
          color={colorMode === "light" ? "gray.600" : "whiteAlpha.700"}
          variant="ghost"
          size="sm"
          _hover={{ bg: "teal.50", color: "teal.600" }}
          _disabled={{ color: colorMode === "light" ? "gray.400" : "whiteAlpha.400", bg: "transparent" }}
          display={{ base: "none", md: "flex" }}
        />
      </Flex>
    </Box>
  ) : null;
};

export default Pagination;
