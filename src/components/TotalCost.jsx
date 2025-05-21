import { useSelector } from 'react-redux';
import { Stat, StatLabel, StatNumber, Box, Card, CardBody, Flex, Icon } from '@chakra-ui/react';
import { FiDollarSign } from 'react-icons/fi';

const TotalCost = () => {
  const totalCost = useSelector((state) =>
    state.items.items.reduce((sum, item) => sum + item.cost, 0) +
    state.otherCosts.otherCosts.reduce((sum, cost) => sum + cost.amount, 0)
  );

  return (
    <Box>
      <Stat>
        <Flex align="center">
          <Icon as={FiDollarSign} boxSize={6} color="blue.500" mr={2} />
          <Box>
            <StatLabel fontSize="sm" color="gray.600">Total Project Cost</StatLabel>
            <StatNumber fontSize="2xl" color="blue.600" fontWeight="bold">
              ${totalCost.toFixed(2)}
            </StatNumber>
          </Box>
        </Flex>
      </Stat>
    </Box>
  );
};

export default TotalCost;