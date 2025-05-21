import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  useDisclosure,
  Divider,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';
import OtherCostForm from '../components/OtherCostForm';
import OtherCostList from '../components/OtherCostList';
import TotalCost from '../components/TotalCost';
import { logout } from '../redux/authSlice';
import { auth } from '../firebase';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const Dashboard = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isAuthenticated, isAuthLoading } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.items);
  const { otherCosts } = useSelector((state) => state.otherCosts);
  const { costThreshold } = useSelector((state) => state.filters);

  const totalItemsCost = items.reduce((sum, item) => sum + item.cost, 0);
  const totalOtherCosts = otherCosts.reduce((sum, cost) => sum + cost.amount, 0);

  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, gray.100)',
    'linear(to-br, gray.800, gray.900)'
  );

  useEffect(() => {
    if (!isAuthLoading && user && isAuthenticated) {
      dispatch(fetchItems(user.uid));
      dispatch(fetchOtherCosts(user.uid));
    } else if (!isAuthLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [dispatch, navigate, user, isAuthenticated, isAuthLoading]);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        dispatch(logout());
        toast({ title: 'Logged out', status: 'info', duration: 3000 });
        navigate('/login');
      })
      .catch((error) => {
        toast({ title: 'Logout failed', description: error.message, status: 'error', duration: 3000 });
      });
  };

  const handleFilterChange = (value) => {
    const threshold = parseFloat(value) || 0;
    dispatch(setCostThreshold(threshold));
    toast({
      title: 'Filter applied',
      description: `Showing costs ≥ $${threshold.toFixed(2)}`,
      status: 'info',
      duration: 2000,
    });
  };

  const handleResetFilter = () => {
    dispatch(resetCostThreshold());
    toast({ title: 'Filter reset', status: 'info', duration: 2000 });
  };

  const chartData = {
    labels: ['Items', 'Other Costs'],
    datasets: [
      {
        data: [totalItemsCost, totalOtherCosts],
        backgroundColor: ['#6366F1', '#06B6D4'],
        borderColor: ['#4F46E5', '#0891B2'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { 
          color: useColorModeValue('#1A202C', '#E2E8F0'),
          font: { size: 14 }
        },
      },
      title: {
        display: true,
        text: 'Cost Breakdown',
        color: useColorModeValue('#1A202C', '#E2E8F0'),
        font: { size: 18, weight: 'bold' },
      },
      tooltip: {
        backgroundColor: useColorModeValue('#FFFFFF', '#2D3748'),
        titleColor: useColorModeValue('#1A202C', '#E2E8F0'),
        bodyColor: useColorModeValue('#1A202C', '#E2E8F0'),
        borderColor: useColorModeValue('#E2E8F0', '#4A5568'),
        borderWidth: 1,
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

  if (isAuthLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bgGradient}>
        <Box p-6>Loading...</Box>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={bgGradient} p={6}>
      <Box maxW="1400px" mx="auto">
        <Flex justify="space-between" mb={8} align="center">
          <Heading size="xl" fontWeight="extrabold" bgGradient="linear(to-r, indigo.600, cyan.600)" bgClip="text">
            Project Cost Tracker
          </Heading>
          <Button 
            colorScheme="red" 
            onClick={handleLogout}
            variant="outline"
            size="lg"
          >
            Logout
          </Button>
        </Flex>

        <TotalCost />

        <Card mb={8} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Filters & Controls</Heading>
              <Button 
                colorScheme="indigo" 
                onClick={onOpen}
                leftIcon={<i className="fas fa-chart-pie"></i>}
                variant="outline"
              >
                Cost Summary
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <Flex wrap="wrap" gap={6} align="center">
              <FormControl maxW={{ base: 'full', md: '300px' }}>
                <FormLabel fontWeight="semibold">Minimum Cost Filter</FormLabel>
                <HStack>
                  <NumberInput 
                    min={0} 
                    value={costThreshold} 
                    onChange={handleFilterChange}
                    w="full"
                  >
                    <NumberInputField
                      placeholder="Enter minimum cost"
                      focusBorderColor="indigo.500"
                      aria-label="Minimum cost filter"
                    />
                  </NumberInput>
                  <Button 
                    colorScheme="gray" 
                    onClick={handleResetFilter}
                    variant="outline"
                  >
                    Reset
                  </Button>
                </HStack>
              </FormControl>
            </Flex>
          </CardBody>
        </Card>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={8}>
          <GridItem>
            <Card boxShadow="lg" borderRadius="xl">
              <CardHeader>
                <Heading size="md" fontWeight="semibold">Items</Heading>
              </CardHeader>
              <CardBody>
                <ItemForm />
                <Divider my={6} />
                <ItemList />
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card boxShadow="lg" borderRadius="xl">
              <CardHeader>
                <Heading size="md" fontWeight="semibold">Other Costs</Heading>
              </CardHeader>
              <CardBody>
                <OtherCostForm />
                <Divider my={6} />
                <OtherCostList />
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontSize="xl" fontWeight="bold">Cost Breakdown</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Pie data={chartData} options={chartOptions} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default Dashboard;