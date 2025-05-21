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
  Card,
  CardBody,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

const ItemForm = () => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { loading } = useSelector((state) => state.items);
  const toast = useToast();

  const isValidName = name.trim() !== '';
  const isValidCost = cost && Number(cost) > 0;
  const isFormValid = isValidName && isValidCost;

  const handleSubmit = async () => {
    if (!isFormValid) {
      toast({
        title: 'Invalid input',
        description: 'Name and positive cost required',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(addItem({ userId: user.uid, name, cost: Number(cost) })).unwrap();
      toast({ 
        title: 'Item added', 
        status: 'success', 
        duration: 3000,
        position: 'top-right'
      });
      setName('');
      setCost('');
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        status: 'error', 
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="outline" mb={6}>
      <CardBody>
        <Heading size="sm" mb={4} color="gray.600">Add New Item</Heading>
        <VStack spacing={4}>
          <FormControl isRequired isInvalid={!isValidName && name !== ''}>
            <FormLabel fontWeight="medium">Item Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              focusBorderColor="indigo.500"
              size="lg"
            />
            {!isValidName && name !== '' && (
              <Text color="red.500" fontSize="sm">Name is required</Text>
            )}
          </FormControl>
          <FormControl isRequired isInvalid={!isValidCost && cost !== ''}>
            <FormLabel fontWeight="medium">Cost ($)</FormLabel>
            <NumberInput min={0} precision={2} step={0.01}>
              <NumberInputField
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Enter cost"
                focusBorderColor="indigo.500"
                size="lg"
              />
            </NumberInput>
            {!isValidCost && cost !== '' && (
              <Text color="red.500" fontSize="sm">Cost must be positive</Text>
            )}
          </FormControl>
          <Button
            colorScheme="indigo"
            onClick={handleSubmit}
            isLoading={loading || isSubmitting}
            isDisabled={!isFormValid || isSubmitting}
            w="full"
            size="lg"
            leftIcon={<Icon as={FaPlus} />}
            mt={2}
          >
            Add Item
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ItemForm;