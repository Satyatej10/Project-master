import { useSelector } from 'react-redux';
import { Stat, StatLabel, StatNumber, Box } from '@chakra-ui/react';

const TotalCost = () => {
  const totalCost = useSelector((state) =>
    state.items.items.reduce((sum, item) => sum + item.cost, 0) +
    state.otherCosts.otherCosts.reduce((sum, cost) => sum + cost.amount, 0)
  );

  return (
    <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
      <Stat>
        <StatLabel color="teal.600" fontWeight="bold">Total Project Cost</StatLabel>
        <StatNumber color="teal.600">${totalCost.toFixed(2)}</StatNumber>
      </Stat>
    </Box>
  );
};

export default TotalCost;