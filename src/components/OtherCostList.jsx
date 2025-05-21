// src/components/OtherCostList.jsx
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
  Input,
  NumberInput,
  NumberInputField,
  useDisclosure,
  HStack,
  useToast,
  Text,
} from '@chakra-ui/react';

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
      toast({ title: 'Invalid input', description: 'Description and positive amount required', status: 'error', duration: 3000 });
      return;
    }
    dispatch(updateOtherCost({ userId: user.uid, id: editCost.id, description: editCost.description, amount: Number(editCost.amount) }));
    toast({ title: 'Cost updated', status: 'success', duration: 3000 });
    onClose();
  };

  const handleDelete = (id) => {
    dispatch(deleteOtherCost({ userId: user.uid, id }));
    toast({ title: 'Cost deleted', status: 'success', duration: 3000 });
  };

  return (
    <>
      <HStack mb={4}>
        <Button
          colorScheme={sortBy === 'description' ? 'teal' : 'gray'}
          onClick={() => setSortBy('description')}
        >
          Sort by Description
        </Button>
        <Button
          colorScheme={sortBy === 'amount' ? 'teal' : 'gray'}
          onClick={() => setSortBy('amount')}
        >
          Sort by Amount
        </Button>
      </HStack>
      <Table variant="simple" bg="white" borderRadius="md" boxShadow="sm" overflowX="auto">
        <Thead>
          <Tr>
            <Th>Description</Th>
            <Th>Amount ($)</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedCosts.length === 0 && (
            <Tr>
              <Td colSpan={3} textAlign="center">No costs match the filter</Td>
            </Tr>
          )}
          {sortedCosts.map((cost) => (
            <Tr key={cost.id}>
              <Td>{cost.description}</Td>
              <Td>${cost.amount.toFixed(2)}</Td>
              <Td>
                <HStack>
                  <Button size="sm" colorScheme="teal" onClick={() => handleEdit(cost)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this cost?')) {
                        handleDelete(cost.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Other Cost</ModalHeader>
          <ModalBody>
            <FormControl isRequired isInvalid={editCost?.description === ''}>
              <FormLabel>Description</FormLabel>
              <Input
                value={editCost?.description || ''}
                onChange={(e) => setEditCost({ ...editCost, description: e.target.value })}
                focusBorderColor="teal.500"
                mb={4}
              />
              {editCost?.description === '' && (
                <Text color="red.500" fontSize="sm">Description is required</Text>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={editCost?.amount <= 0}>
              <FormLabel>Amount</FormLabel>
              <NumberInput min={0}>
                <NumberInputField
                  value={editCost?.amount || ''}
                  onChange={(e) => setEditCost({ ...editCost, amount: e.target.value })}
                  focusBorderColor="teal.500"
                />
              </NumberInput>
              {editCost?.amount <= 0 && (
                <Text color="red.500" fontSize="sm">Amount must be positive</Text>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleUpdate}>Save</Button>
            <Button ml={2} variant="outline" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OtherCostList;