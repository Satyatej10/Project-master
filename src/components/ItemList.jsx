// src/components/ItemList.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateItem, deleteItem } from '../redux/itemsSlice';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModaltermsOverlay,
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

const ItemList = () => {
  const [sortBy, setSortBy] = useState('name');
  const items = useSelector((state) => state.items.items);
  const { costThreshold } = useSelector((state) => state.filters);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [editItem, setEditItem] = useState(null);

  const filteredItems = items.filter((item) => item.cost >= costThreshold);
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return a.cost - b.cost;
  });

  const handleEdit = (item) => {
    setEditItem(item);
    onOpen();
  };

  const handleUpdate = () => {
    if (!editItem?.name || editItem.cost <= 0) {
      toast({ title: 'Invalid input', description: 'Name and positive cost required', status: 'error', duration: 3000 });
      return;
    }
    dispatch(updateItem({ userId: user.uid, id: editItem.id, name: editItem.name, cost: Number(editItem.cost) }));
    toast({ title: 'Item updated', status: 'success', duration: 3000 });
    onClose();
  };

  const handleDelete = (id) => {
    dispatch(deleteItem({ userId: user.uid, id }));
    toast({ title: 'Item deleted', status: 'success', duration: 3000 });
  };

  return (
    <>
      <HStack mb={4}>
        <Button
          colorScheme={sortBy === 'name' ? 'teal' : 'gray'}
          onClick={() => setSortBy('name')}
        >
          Sort by Name
        </Button>
        <Button
          colorScheme={sortBy === 'cost' ? 'teal' : 'gray'}
          onClick={() => setSortBy('cost')}
        >
          Sort by Cost
        </Button>
      </HStack>
      <Table variant="simple" bg="white" borderRadius="md" boxShadow="sm" overflowX="auto">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Cost ($)</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedItems.length === 0 && (
            <Tr>
              <Td colSpan={3} textAlign="center">No items match the filter</Td>
            </Tr>
          )}
          {sortedItems.map((item) => (
            <Tr key={item.id}>
              <Td>{item.name}</Td>
              <Td>${item.cost.toFixed(2)}</Td>
              <Td>
                <HStack>
                  <Button size="sm" colorScheme="teal" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this item?')) {
                        handleDelete(item.id);
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
          <ModalHeader>Edit Item</ModalHeader>
          <ModalBody>
            <FormControl isRequired isInvalid={editItem?.name === ''}>
              <FormLabel>Name</FormLabel>
              <Input
                value={editItem?.name || ''}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                focusBorderColor="teal.500"
                mb={4}
              />
              {editItem?.name === '' && (
                <Text color="red.500" fontSize="sm">Name is required</Text>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={editItem?.cost <= 0}>
              <FormLabel>Cost</FormLabel>
              <NumberInput min={0}>
                <NumberInputField
                  value={editItem?.cost || ''}
                  onChange={(e) => setEditItem({ ...editItem, cost: e.target.value })}
                  focusBorderColor="teal.500"
                />
              </NumberInput>
              {editItem?.cost <= 0 && (
                <Text color="red.500" fontSize="sm">Cost must be positive</Text>
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

export default ItemList;