import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, resetError } from '../redux/authSlice';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  Heading,
  Box,
  Text,
  Link as ChakraLink,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const toast = useToast();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const bgGradient = useColorModeValue(
    'linear(to-br, gray.500, gray.900)',
    'linear(to-br, gray.100, gray.900)'
  );

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = email && password && isValidEmail(email);

  const handleLogin = async () => {
    dispatch(resetError());
    try {
      await dispatch(login({ email, password })).unwrap();
      toast({ title: 'Login successful', status: 'success', duration: 3000 });
      navigate('/');
    } catch (error) {
      toast({ title: 'Login failed', description: error, status: 'error', duration: 3000 });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgGradient}
      p={4}
    >
      <Box
        bg={useColorModeValue('white', 'gray.800')}
        p={8}
        borderRadius="xl"
        boxShadow="lg"
        maxW="400px"
        w="full"
      >
        <VStack spacing={6}>
          <Heading
            size="lg"
            bgGradient="linear(to-r, indigo.600, cyan.600)"
            
          >
            Login to Cost Tracker
          </Heading>
          {error && <Text color="red.500">{error}</Text>}
          <FormControl isRequired isInvalid={email && !isValidEmail(email)}>
            <FormLabel>Email</FormLabel>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              focusBorderColor="indigo.500"
            />
            {email && !isValidEmail(email) && (
              <Text color="red.500" fontSize="sm">Invalid email format</Text>
            )}
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              focusBorderColor="indigo.500"
            />
          </FormControl>
          <Button
            
            onClick={handleLogin}
            isLoading={loading}
            isDisabled={!isFormValid}
            w="full"
          >
            Login
          </Button>
          <ChakraLink as={Link} to="/signup" color="indigo.500">
            Don't have an account? Sign up
          </ChakraLink>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;