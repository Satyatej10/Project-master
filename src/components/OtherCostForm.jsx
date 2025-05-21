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
  Card,
  CardBody,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

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
      toast({ 
        title: 'Invalid input', 
        description: 'Description and positive amount required', 
        status: 'error', 
        duration: 3000,
        position: 'top-right'
      });
      return;
    }
    try {
      await dispatch(addOtherCost({ userId: user.uid, description, amount: Number(amount) })).unwrap();
      toast({ 
        title: 'Other cost added', 
        status: 'success', 
        duration: 3000,
        position: 'top-right'
      });
      setDescription('');
      setAmount('');
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        status: 'error', 
        duration: 3000,
        position: 'top-right'
      });
    }
  };

  return (
    <Card variant="outline" mb={6}>
      <CardBody>
        <Heading size="sm" mb={4} color="gray.600">Add Other Cost</Heading>
        <VStack spacing={4}>
          <FormControl isRequired isInvalid={!isValidDescription && description !== ''}>
            <FormLabel fontWeight="medium">Description</FormLabel>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              focusBorderColor="indigo.500"
              size="lg"
            />
            {!isValidDescription && description !== '' && (
              <Text color="red.500" fontSize="sm">Description is required</Text>
            )}
          </FormControl>
          <FormControl isRequired isInvalid={!isValidAmount && amount !== ''}>
            <FormLabel fontWeight="medium">Amount ($)</FormLabel>
            <NumberInput min={0} precision={2} step={0.01}>
              <NumberInputField
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                focusBorderColor="indigo.500"
                size="lg"
              />
            </NumberInput>
            {!isValidAmount && amount !== '' && (
              <Text color="red.500" fontSize="sm">Amount must be positive</Text>
            )}
          </FormControl>
          <Button
            colorScheme="indigo"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!isFormValid}
            w="full"
            size="lg"
            leftIcon={<Icon as={FaPlus} />}
            mt={2}
          >
            Add Other Cost
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OtherCostForm;