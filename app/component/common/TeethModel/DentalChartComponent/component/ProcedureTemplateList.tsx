import {
    VStack,
    HStack,
    Text,
    Box,
    Input,
    Icon,
    Badge,
    Collapse,
    useDisclosure,
    Heading,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { FiSearch, FiChevronDown, FiChevronRight, FiPlus } from "react-icons/fi";
import { TREATMENT_CATEGORIES } from "../../../../../dashboard/toothTreatment/treatmentDataConstant";

interface ProcedureTemplateListProps {
    onSelect: (procedurePath: string) => void;
}

export const ProcedureTemplateList = ({ onSelect }: ProcedureTemplateListProps) => {
    const [search, setSearch] = useState("");

    const flatProcedures = useMemo(() => {
        const result: { category: string, subcategory: string, job: string }[] = [];
        TREATMENT_CATEGORIES.forEach(cat => {
            cat.subcategories.forEach(sub => {
                sub.jobs.forEach(job => {
                    result.push({
                        category: cat.name,
                        subcategory: sub.name,
                        job: job.name
                    });
                });
            });
        });
        return result;
    }, []);

    const filteredProcedures = useMemo(() => {
        if (!search.trim()) return null; // Show tree when search is empty
        const term = search.toLowerCase();
        return flatProcedures.filter(p =>
            p.job.toLowerCase().includes(term) ||
            p.subcategory.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );
    }, [flatProcedures, search]);

    return (
        <VStack align="stretch" spacing={4}>
            <HStack bg="gray.50" p={2} borderRadius="xl" border="1px solid" borderColor="gray.100">
                <Icon as={FiSearch} color="gray.400" ml={2} />
                <Input
                    placeholder="Search procedures..."
                    variant="unstyled"
                    fontSize="sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </HStack>

            <Box maxH="calc(100vh - 250px)" overflowY="auto" pr={2} sx={{
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: 'gray.100', borderRadius: '10px' },
            }}>
                {filteredProcedures ? (
                    <VStack align="stretch" spacing={2}>
                        {filteredProcedures.map((p, idx) => (
                            <Box
                                key={idx}
                                p={3}
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="gray.50"
                                cursor="pointer"
                                _hover={{ bg: "blue.50", borderColor: "blue.200" }}
                                onClick={() => onSelect(`${p.category} → ${p.subcategory} → ${p.job}`)}
                            >
                                <HStack justify="space-between">
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="xs" fontWeight="900" color="gray.700">{p.job}</Text>
                                        <Text fontSize="10px" color="gray.400">{p.category} • {p.subcategory}</Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                ) : (
                    <VStack align="stretch" spacing={3}>
                        {TREATMENT_CATEGORIES.map((cat, catIdx) => (
                            <CategorySection key={catIdx} category={cat} onSelect={onSelect} />
                        ))}
                    </VStack>
                )}
            </Box>
        </VStack>
    );
};

const CategorySection = ({ category, onSelect }: { category: any, onSelect: any }) => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });

    return (
        <VStack align="stretch" spacing={1}>
            <HStack
                px={3} py={2} bg="gray.50/50" borderRadius="lg" cursor="pointer"
                onClick={onToggle} _hover={{ bg: "gray.50" }}
            >
                <Icon as={isOpen ? FiChevronDown : FiChevronRight} color="blue.500" />
                <Text fontSize="xs" fontWeight="900" color="gray.700" letterSpacing="wide">{category.name.toUpperCase()}</Text>
            </HStack>
            <Collapse in={isOpen}>
                <VStack align="stretch" pl={4} pt={1} spacing={2} borderLeft="2px solid" borderColor="blue.50" ml={2}>
                    {category.subcategories.map((sub: any, subIdx: number) => (
                        <VStack key={subIdx} align="stretch" spacing={1}>
                            <Text fontSize="11px" fontWeight="800" color="blue.400" mt={1}>{sub.name}</Text>
                            {sub.jobs.map((job: any, jobIdx: number) => (
                                <HStack
                                    key={jobIdx}
                                    px={2} py={1.5} borderRadius="md" cursor="pointer"
                                    _hover={{ bg: "blue.50/50" }}
                                    onClick={() => onSelect(`${category.name} → ${sub.name} → ${job.name}`)}
                                >
                                    <Icon as={FiPlus} fontSize="xs" color="gray.300" />
                                    <Text fontSize="xs" fontWeight="700" color="gray.600">{job.name}</Text>
                                    <HStack flex={1} justify="end">
                                        <Text fontSize="10px" fontWeight="800" color="blue.300">₹{job.defaultEstimate}</Text>
                                    </HStack>
                                </HStack>
                            ))}
                        </VStack>
                    ))}
                </VStack>
            </Collapse>
        </VStack>
    );
};
