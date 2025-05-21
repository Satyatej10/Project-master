import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addOtherCost } from '../redux/otherCostsSlice';
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

const OtherCostForm = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { loading } = useSelector((state) => state.otherCosts);
  const toast = useToast();

  const isValidDescription = description.trim() !== '';
  const isValidAmount = amount && Number(amount) > 0;
  const isFormValid = isValidDescription && isValidAmount;

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast({ title: 'Invalid input', description: 'Description and positive amount required', status: 'error', duration: 3000 });
      return;
    }
    try {
      await dispatch(addOtherCost({ userId: user.uid, description, amount: Number(amount) })).unwrap();
      toast({ title: 'Other cost added', status: 'success', duration: 3000 });
      setDescription('');
      setAmount('');
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
    }
  };

  return (
    <VStack spacing={4} w="full" maxW="400px" bg="white" p={4} borderRadius="md" boxShadow="sm">
      <FormControl isRequired isInvalid={!isValidDescription && description !== ''}>
        <FormLabel>Description</FormLabel>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          focusBorderColor="teal.500"
        />
        {!isValidDescription && description !== '' && (
          <Text color="red.500" fontSize="sm">Description is required</Text>
        )}
      </FormControl>
      <FormControl isRequired isInvalid={!isValidAmount && amount !== ''}>
        <FormLabel>Amount ($)</FormLabel>
        <NumberInput min={0}>
          <NumberInputField
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            focusBorderColor="teal.500"
          />
        </NumberInput>
        {!isValidAmount && amount !== '' && (
          <Text color="red.500" fontSize="sm">Amount must be positive</Text>
        )}
      </FormControl>
      <Button
        colorScheme="teal"
        onClick={handleSubmit}
        isLoading={loading}
        isDisabled={!isFormValid}
        w="full"
      >
        Add Other Cost
      </Button>
    </VStack>
  );
};

export default OtherCostForm;