import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOtherCost, deleteOtherCost } from '../redux/otherCostsSlice';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  useDisclosure,
  HStack,
  useToast,
  Text,
  Badge,
  Icon,
  ModalCloseButton,
  Tooltip,
  Box,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaSortAmountDown, FaSortAlphaDown } from 'react-icons/fa';

const OtherCostList = () => {
  const [sortBy, setSortBy] = useState('description');
  const otherCosts = useSelector((state) => state.otherCosts.otherCosts);
  const { costThreshold } = useSelector((state) => state.filters);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [editCost, setEditCost] = useState(null);

  const filteredCosts = otherCosts.filter((cost) => cost.amount >= costThreshold);
  const sortedCosts = [...filteredCosts].sort((a, b) => {
    if (sortBy === 'description') return a.description.localeCompare(b.description);
    return a.amount - b.amount;
  });

  const handleEdit = (cost) => {
    setEditCost(cost);
    onOpen();
  };

  const handleUpdate = () => {
    if (!editCost?.description || editCost.amount <= 0) {
      toast({ 
        title: 'Invalid input', 
        description: 'Description and positive amount required', 
        status: 'error', 
        duration: 3000,
        position: 'top-right'
      });
      return;
    }
    dispatch(updateOtherCost({ userId: user.uid, id: editCost.id, description: editCost.description, amount: Number(editCost.amount) }));
    toast({ 
      title: 'Cost updated', 
      status: 'success', 
      duration: 3000,
      position: 'top-right'
    });
    onClose();
  };

  const handleDelete = (id) => {
    dispatch(deleteOtherCost({ userId: user.uid, id }));
    toast({ 
      title: 'Cost deleted', 
      status: 'success', 
      duration: 3000,
      position: 'top-right'
    });
  };

  return (
    <>
      <HStack mb={6} spacing={4}>
        <Tooltip label="Sort by description">
          <Button
            variant={sortBy === 'description' ? 'solid' : 'outline'}
            colorScheme="indigo"
            onClick={() => setSortBy('description')}
            leftIcon={<Icon as={FaSortAlphaDown} />}
          >
            Description
          </Button>
        </Tooltip>
        <Tooltip label="Sort by amount">
          <Button
            variant={sortBy === 'amount' ? 'solid' : 'outline'}
            colorScheme="indigo"
            onClick={() => setSortBy('amount')}
            leftIcon={<Icon as={FaSortAmountDown} />}
          >
            Amount
          </Button>
        </Tooltip>
        <Badge colorScheme="cyan" fontSize="md" px={3} py={1} borderRadius="full">
          {filteredCosts.length} {filteredCosts.length === 1 ? 'cost' : 'costs'}
        </Badge>
      </HStack>

      <Box overflowX="auto">
        <Table variant="striped" colorScheme="gray">
          <Thead bg="indigo.500">
            <Tr>
              <Th color="white">Description</Th>
              <Th color="white">Amount ($)</Th>
              <Th color="white" textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedCosts.length === 0 && (
              <Tr>
                <Td colSpan={3} textAlign="center" py={8}>
                  <Text color="gray.500">No costs match the current filter</Text>
                </Td>
              </Tr>
            )}
            {sortedCosts.map((cost) => (
              <Tr key={cost.id} _hover={{ bg: 'gray.50' }}>
                <Td fontWeight="medium">{cost.description}</Td>
                <Td>${cost.amount.toFixed(2)}</Td>
                <Td textAlign="right">
                  <HStack spacing={2} justify="flex-end">
                    <Tooltip label="Edit cost">
                      <Button
                        size="sm"
                        colorScheme="indigo"
                        variant="outline"
                        onClick={() => handleEdit(cost)}
                        leftIcon={<Icon as={FaEdit} boxSize={3} />}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Tooltip label="Delete cost">
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this cost?')) {
                            handleDelete(cost.id);
                          }
                        }}
                        leftIcon={<Icon as={FaTrash} boxSize={3} />}
                      >
                        Delete
                      </Button>
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="xl">Edit Other Cost</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={editCost?.description === ''} mb={4}>
              <FormLabel fontWeight="medium">Description</FormLabel>
              <Input
                value={editCost?.description || ''}
                onChange={(e) => setEditCost({ ...editCost, description: e.target.value })}
                focusBorderColor="indigo.500"
                size="lg"
              />
              {editCost?.description === '' && (
                <Text color="red.500" fontSize="sm">Description is required</Text>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={editCost?.amount <= 0}>
              <FormLabel fontWeight="medium">Amount</FormLabel>
              <NumberInput min={0} precision={2} step={0.01} value={editCost?.amount || ''}>
                <NumberInputField
                  onChange={(e) => setEditCost({ ...editCost, amount: e.target.value })}
                  focusBorderColor="indigo.500"
                  size="lg"
                />
              </NumberInput>
              {editCost?.amount <= 0 && (
                <Text color="red.500" fontSize="sm">Amount must be positive</Text>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="indigo" onClick={handleUpdate} mr={3}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OtherCostList;