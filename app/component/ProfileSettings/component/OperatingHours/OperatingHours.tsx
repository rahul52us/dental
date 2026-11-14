import { AddIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Switch,
  Text,
  Tooltip,
  VStack
} from '@chakra-ui/react'

const OperatingHours = ({ schedule, setSchedule }) => {
  const handleToggleDay = (index) => {
    const newSchedule = [...schedule]
    newSchedule[index].isOpen = !newSchedule[index].isOpen
    setSchedule(newSchedule)
  }

  const handleAddSlot = (dayIndex) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots.push({ start: '', end: '' })
    setSchedule(newSchedule)
  }

  const handleRemoveSlot = (dayIndex, slotIndex) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots.splice(slotIndex, 1)
    setSchedule(newSchedule)
  }

  const handleTimeChange = (dayIndex, slotIndex, field, value) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots[slotIndex][field] = value
    setSchedule(newSchedule)
  }

  return (
    <Box
      w="100%"
      p={{ base: 3, md: 4 }}
      bg="white"
      borderRadius={{ base: "lg", md: "xl" }}
      borderWidth="1px"
      borderColor="gray.200"
      shadow="sm"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={3} pb={3} borderBottomWidth="1px" borderColor="gray.100">
        <Box>
            <HStack mb={1}>
                <TimeIcon color="teal.500" boxSize={4} />
                <Heading size={{ base: "sm", md: "md" }} color="gray.700">Operating hours</Heading>
            </HStack>
            <Text fontSize="xs" color="gray.500">
                Set your weekly availability and appointment time slots.
            </Text>
        </Box>
      </Flex>

      {/* Schedule List */}
      <VStack spacing={0} align="stretch" divider={<Divider borderColor="gray.100" />}>
        {schedule.map((dayData, dayIndex) => (
          <Flex 
            key={dayData.day} 
            py={{ base: 3, md: 5 }}
            direction={{ base: 'column', md: 'row' }} 
            align={{ base: 'flex-start', md: 'flex-start' }}
            bg={dayData.isOpen ? 'transparent' : 'gray.50'}
            _hover={{ bg: dayData.isOpen ? 'gray.50' : 'gray.100' }}
            transition="background 0.2s"
            borderRadius="md"
            px={{ base: 2, md: 4 }}
            mx={{ base: -2, md: -4 }}
          >
            {/* Left Column: Day Toggle */}
            <Flex width={{ base: '100%', md: '200px' }} align="center" mb={{ base: 3, md: 0 }}>
              <Switch
                isChecked={dayData.isOpen} 
                onChange={() => handleToggleDay(dayIndex)} 
                colorScheme="green"
                mr={{ base: 3, md: 4 }}
                size="md"
              />
              <Box>
                <Text fontWeight="bold" color="gray.700">{dayData.day}</Text>
                <Badge 
                    colorScheme={dayData.isOpen ? "green" : "red"} 
                    variant="subtle" 
                    fontSize="0.65rem"
                >
                    {dayData.isOpen ? "OPEN" : "CLOSED"}
                </Badge>
              </Box>
            </Flex>

            {/* Right Column: Time Slots */}
            <Box flex={1} width="100%">
              {dayData.isOpen ? (
                <VStack align="stretch" spacing={3}>
                  {dayData.slots.map((slot, slotIndex) => (
                    <Flex
                      key={slotIndex}
                      direction={{ base: "column", md: "row" }}
                      gap={{ base: 2, md: 3 }}
                      align={{ base: "stretch", md: "flex-end" }}
                      w="100%"
                      p={{ base: 2, md: 0 }}
                      border={{ base: "1px solid", md: "none" }}
                      borderColor={{ base: "gray.200", md: "transparent" }}
                      borderRadius="lg"
                    >
                      <FormControl flex={1} minW={0} maxW={{ md: "150px" }}>
                        {slotIndex === 0 && (
                            <FormLabel fontSize="10px" color="gray.500" mb={1} textTransform="uppercase" fontWeight="bold">
                                Opens at
                            </FormLabel>
                        )}
                        <Input 
                          type="time" 
                          size="sm"
                          bg="white"
                          minW={0}
                          minH="40px"
                          value={slot.start} 
                          onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'start', e.target.value)}
                        />
                      </FormControl>
                      
                      <Text display={{ base: "none", md: "block" }} pb={2} color="gray.400" fontSize="xs">to</Text>

                      <FormControl flex={1} minW={0} maxW={{ md: "150px" }}>
                         {slotIndex === 0 && (
                            <FormLabel fontSize="10px" color="gray.500" mb={1} textTransform="uppercase" fontWeight="bold">
                                Closes at
                            </FormLabel>
                        )}
                        <Input 
                          type="time" 
                          size="sm"
                          bg="white"
                          minW={0}
                          minH="40px"
                          value={slot.end}
                          onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'end', e.target.value)}
                        />
                      </FormControl>

                      <Tooltip label="Remove this shift" hasArrow>
                        <IconButton
                            aria-label="Remove slot"
                            icon={<DeleteIcon />}
                            size="sm"
                            minW="40px"
                            minH="40px"
                            variant="ghost"
                            colorScheme="red"
                            opacity={0.6}
                            _hover={{ opacity: 1, bg: 'red.50' }}
                            mb={0}
                            alignSelf={{ base: "flex-end", md: "auto" }}
                            onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                            isDisabled={dayData.slots.length === 1 && slotIndex === 0} 
                        />
                      </Tooltip>
                    </Flex>
                  ))}

                  {/* Add Slot Button */}
                  <Button
                    size="sm"
                    leftIcon={<AddIcon />}
                    variant="link"
                    colorScheme="blue"
                    alignSelf="flex-start"
                    mt={1}
                    minH="40px"
                    onClick={() => handleAddSlot(dayIndex)}
                  >
                    Add split shift
                  </Button>
                </VStack>
              ) : (
                <Flex h="100%" align="center">
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                        Not accepting appointments on this day.
                    </Text>
                </Flex>
              )}
            </Box>
          </Flex>
        ))}
      </VStack>
    </Box>
  )
}

export default OperatingHours