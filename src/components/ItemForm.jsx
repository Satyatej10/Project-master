import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../redux/itemsSlice';
import {
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Button,
  VStack,
  useToast,
  Text,
} from '@chakra-ui/react';

const ItemForm = () => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { loading } = useSelector((state) => state.items);
  const toast = useToast();

  const isValidName = name.trim() !== '';
  const isValidCost = cost && Number(cost) > 0;
  const isFormValid = isValidName && isValidCost;

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast({ title: 'Invalid input', description: 'Name and positive cost required', status: 'error', duration: 3000 });
      return;
    }
    try {
      await dispatch(addItem({ userId: user.uid, name, cost: Number(cost) })).unwrap();
      toast({ title: 'Item added', status: 'success', duration: 3000 });
      setName('');
      setCost('');
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
    }
  };

  return (
    <VStack spacing={4} w="full" maxW="400px" bg="white" p={4} borderRadius="md" boxShadow="sm">
      <FormControl isRequired isInvalid={!isValidName && name !== ''}>
        <FormLabel>Item Name</FormLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter item name"
          focusBorderColor="teal.500"
        />
        {!isValidName && name !== '' && (
          <Text color="red.500" fontSize="sm">Name is required</Text>
        )}
      </FormControl>
      <FormControl isRequired isInvalid={!isValidCost && cost !== ''}>
        <FormLabel>Cost ($)</FormLabel>
        <NumberInput min={0}>
          <NumberInputField
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Enter cost"
            focusBorderColor="teal.500"
          />
        </NumberInput>
        {!isValidCost && cost !== '' && (
          <Text color="red.500" fontSize="sm">Cost must be positive</Text>
        )}
      </FormControl>
      <Button
        colorScheme="teal"
        onClick={handleSubmit}
        isLoading={loading}
        isDisabled={!isFormValid}
        w="full"
      >
        Add Item
      </Button>
    </VStack>
  );
};

export default ItemForm;