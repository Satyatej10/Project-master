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
  Box,
  Heading,
  ModalCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  FormControl,
  FormLabel,
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
  Badge,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaSortAmountDown, FaSortAlphaDown } from 'react-icons/fa';

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
      toast({ 
        title: 'Invalid input', 
        description: 'Name and positive cost required', 
        status: 'error', 
        duration: 3000,
        position: 'top-right'
      });
      return;
    }
    dispatch(updateItem({ userId: user.uid, id: editItem.id, name: editItem.name, cost: Number(editItem.cost) }));
    toast({ 
      title: 'Item updated', 
      status: 'success', 
      duration: 3000,
      position: 'top-right'
    });
    onClose();
  };

  const handleDelete = (id) => {
    dispatch(deleteItem({ userId: user.uid, id }));
    toast({ 
      title: 'Item deleted', 
      status: 'success', 
      duration: 3000,
      position: 'top-right'
    });
  };

  return (
    <>
      <HStack mb={6} spacing={4}>
        <Tooltip label="Sort by name">
          <Button
            variant={sortBy === 'name' ? 'solid' : 'outline'}
            colorScheme="indigo"
            onClick={() => setSortBy('name')}
            leftIcon={<Icon as={FaSortAlphaDown} />}
          >
            Name
          </Button>
        </Tooltip>
        <Tooltip label="Sort by cost">
          <Button
            variant={sortBy === 'cost' ? 'solid' : 'outline'}
            colorScheme="indigo"
            onClick={() => setSortBy('cost')}
            leftIcon={<Icon as={FaSortAmountDown} />}
          >
            Cost
          </Button>
        </Tooltip>
        <Badge colorScheme="cyan" fontSize="md" px={3} py={1} borderRadius="full">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </Badge>
      </HStack>

      <Box overflowX="auto">
        <Table variant="striped" colorScheme="gray">
          <Thead bg="indigo.500">
            <Tr>
              <Th color="white">Name</Th>
              <Th color="white">Cost ($)</Th>
              <Th color="white" textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedItems.length === 0 && (
              <Tr>
                <Td colSpan={3} textAlign="center" py={8}>
                  <Text color="gray.500">No items match the current filter</Text>
                </Td>
              </Tr>
            )}
            {sortedItems.map((item) => (
              <Tr key={item.id} _hover={{ bg: 'gray.50' }}>
                <Td fontWeight="medium">{item.name}</Td>
                <Td>${item.cost.toFixed(2)}</Td>
                <Td textAlign="right">
                  <HStack spacing={2} justify="flex-end">
                    <Tooltip label="Edit item">
                      <Button
                        size="sm"
                        colorScheme="indigo"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        leftIcon={<Icon as={FaEdit} boxSize={3} />}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Tooltip label="Delete item">
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this item?')) {
                            handleDelete(item.id);
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
          <ModalHeader fontSize="xl">Edit Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={editItem?.name === ''} mb={4}>
              <FormLabel fontWeight="medium">Name</FormLabel>
              <Input
                value={editItem?.name || ''}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                focusBorderColor="indigo.500"
                size="lg"
              />
              {editItem?.name === '' && (
                <Text color="red.500" fontSize="sm">Name is required</Text>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={editItem?.cost <= 0}>
              <FormLabel fontWeight="medium">Cost</FormLabel>
              <NumberInput min={0} precision={2} step={0.01} value={editItem?.cost || ''}>
                <NumberInputField
                  onChange={(e) => setEditItem({ ...editItem, cost: e.target.value })}
                  focusBorderColor="indigo.500"
                  size="lg"
                />
              </NumberInput>
              {editItem?.cost <= 0 && (
                <Text color="red.500" fontSize="sm">Cost must be positive</Text>
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

export default ItemList;