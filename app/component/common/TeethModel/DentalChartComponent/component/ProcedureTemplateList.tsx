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
    Spinner,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { FiSearch, FiChevronDown, FiChevronRight, FiPlus } from "react-icons/fi";
import { TREATMENT_CATEGORIES } from "../../../../../dashboard/toothTreatment/treatmentDataConstant";
import { observer } from "mobx-react-lite";
import stores from "../../../../../store/stores";


interface ProcedureTemplateListProps {
    onSelect: (procedurePath: string) => void;
}

export const ProcedureTemplateList = observer(({ onSelect }: ProcedureTemplateListProps) => {
    const { procedureStore } = stores;
    const [search, setSearch] = useState("");

    useEffect(() => {
        procedureStore.getProcedures();
    }, []);

    const groupedData = useMemo(() => {
        const dbData = procedureStore.procedures.data;
        if (dbData.length === 0) return TREATMENT_CATEGORIES;

        const map: any = {};
        dbData.forEach((p: any) => {
            if (!map[p.category]) map[p.category] = { name: p.category, subcategories: {} };
            if (!map[p.category].subcategories[p.subcategory]) {
                map[p.category].subcategories[p.subcategory] = { name: p.subcategory, jobs: [] };
            }
            map[p.category].subcategories[p.subcategory].jobs.push({
                name: p.name,
                estimateMin: p.estimateMin,
                estimateMax: p.estimateMax,
                defaultEstimate: p.defaultEstimate
            });
        });

        return Object.values(map).map((cat: any) => ({
            ...cat,
            subcategories: Object.values(cat.subcategories)
        }));
    }, [procedureStore.procedures.data]);

    const flatProcedures = useMemo(() => {
        const result: { category: string, subcategory: string, job: string }[] = [];
        groupedData.forEach((cat: any) => {
            cat.subcategories.forEach((sub: any) => {
                sub.jobs.forEach((job: any) => {
                    result.push({
                        category: cat.name,
                        subcategory: sub.name,
                        job: job.name
                    });
                });
            });
        });
        return result;
    }, [groupedData]);

    const filteredProcedures = useMemo(() => {
        if (!search.trim()) return null;
        const term = search.toLowerCase();
        return flatProcedures.filter(p =>
            p.job.toLowerCase().includes(term) ||
            p.subcategory.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );
    }, [flatProcedures, search]);

    if (procedureStore.procedures.loading && procedureStore.procedures.data.length === 0) {
        return (
            <VStack py={10}>
                <Spinner color="blue.500" />
                <Text fontSize="xs" color="gray.500">Loading procedures...</Text>
            </VStack>
        );
    }

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
                        {groupedData.map((cat: any, catIdx: number) => (
                            <CategorySection key={catIdx} category={cat} onSelect={onSelect} />
                        ))}
                    </VStack>
                )}
            </Box>
        </VStack>
    );
});

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
                                </HStack>
                            ))}
                        </VStack>
                    ))}
                </VStack>
            </Collapse>
        </VStack>
    );
};
