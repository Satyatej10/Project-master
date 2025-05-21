import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { setUser } from '../redux/authSlice';
import { fetchItems } from '../redux/itemsSlice';
import { fetchOtherCosts } from '../redux/otherCostsSlice';
import { setCostThreshold, resetCostThreshold } from '../redux/filterSlice';
import {
  Box,
  Button,
  Flex,
  Heading,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  useToast,
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';
import OtherCostForm from '../components/OtherCostForm';
import OtherCostList from '../components/OtherCostList';
import TotalCost from '../components/TotalCost';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Dashboard = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.items);
  const { otherCosts } = useSelector((state) => state.otherCosts);
  const { costThreshold } = useSelector((state) => state.filters);

  const totalItemsCost = items.reduce((sum, item) => sum + item.cost, 0);
  const totalOtherCosts = otherCosts.reduce((sum, cost) => sum + cost.amount, 0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || null,
          photoURL: firebaseUser.photoURL || null,
        }));
        dispatch(fetchItems(firebaseUser.uid));
        dispatch(fetchOtherCosts(firebaseUser.uid));
      } else {
        dispatch(setUser(null));
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [dispatch, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    toast({ title: 'Logged out', status: 'info', duration: 3000 });
    navigate('/login');
  };

  const handleFilterChange = (value) => {
    const threshold = parseFloat(value) || 0;
    dispatch(setCostThreshold(threshold));
    toast({ title: 'Filter applied', description: `Showing costs ≥ $${threshold.toFixed(2)}`, status: 'info', duration: 2000 });
  };

  const handleResetFilter = () => {
    dispatch(resetCostThreshold());
    toast({ title: 'Filter reset', status: 'info', duration: 2000 });
  };

  // Chart data and options
  const chartData = {
    labels: ['Items', 'Other Costs'],
    datasets: [
      {
        data: [totalItemsCost, totalOtherCosts],
        backgroundColor: ['#4FD1C5', '#F56565'],
        borderColor: ['#2C7A7B', '#C53030'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#333' },
      },
      title: {
        display: true,
        text: 'Cost Breakdown',
        color: '#333',
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            let value = context.parsed || 0;
            return `${label}: $${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <Box p={6} maxW="1200px" mx="auto" bg="gray.50" borderRadius="md" boxShadow="md">
      <Flex justify="space-between" mb={6} align="center">
        <Heading size="lg" color="teal.600">Project Cost Tracker</Heading>
        <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
      </Flex>

      <Flex mb={6} wrap="wrap" gap={4} align="center">
        <FormControl maxW={{ base: 'full', md: '300px' }}>
          <FormLabel>Filter by Minimum Cost</FormLabel>
          <HStack>
            <NumberInput min={0} value={costThreshold} onChange={handleFilterChange} w="full">
              <NumberInputField
                placeholder="Enter minimum cost"
                focusBorderColor="teal.500"
                aria-label="Minimum cost filter"
              />
            </NumberInput>
            <Button colorScheme="gray" onClick={handleResetFilter}>Reset</Button>
          </HStack>
        </FormControl>
        <Button colorScheme="teal" onClick={onOpen} aria-label="View cost summary chart">
          View Cost Summary
        </Button>
      </Flex>

      <Box mb={6}>
        <TotalCost />
      </Box>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        <GridItem>
          <Heading size="md" mb={4} color="teal.600">Items</Heading>
          <ItemForm />
          <ItemList />
        </GridItem>
        <GridItem>
          <Heading size="md" mb={4} color="teal.600">Other Costs</Heading>
          <OtherCostForm />
          <OtherCostList />
        </GridItem>
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cost Breakdown</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Pie data={chartData} options={chartOptions} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard;