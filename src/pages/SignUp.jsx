// src/pages/SignUp.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup, resetError } from '../redux/authSlice';
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
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const toast = useToast();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => password.length >= 6;
  const isFormValid = email && password && isValidEmail(email) && isValidPassword(password);

  const handleSignUp = async () => {
    dispatch(resetError()); // Clear previous errors
    try {
      await dispatch(signup({ email, password })).unwrap();
      toast({ title: 'Sign-up successful', status: 'success', duration: 3000 });
      navigate('/'); // Redirect to dashboard
    } catch (error) {
      toast({ title: 'Sign-up failed', description: error, status: 'error', duration: 3000 });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, teal.500, blue.500)"
      p={4}
    >
      <Box
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="lg"
        maxW="400px"
        w="full"
      >
        <VStack spacing={6}>
          <Heading size="lg" color="teal.600">Sign Up for Cost Tracker</Heading>
          {error && <Text color="red.500">{error}</Text>}
          <FormControl isRequired isInvalid={email && !isValidEmail(email)}>
            <FormLabel>Email</FormLabel>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              focusBorderColor="teal.500"
            />
            {email && !isValidEmail(email) && (
              <Text color="red.500" fontSize="sm">Invalid email format</Text>
            )}
          </FormControl>
          <FormControl isRequired isInvalid={password && !isValidPassword(password)}>
            <FormLabel>Password</FormLabel>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password (min 6 characters)"
              focusBorderColor="teal.500"
            />
            {password && !isValidPassword(password) && (
              <Text color="red.500" fontSize="sm">Password must be at least 6 characters</Text>
            )}
          </FormControl>
          <Button
            colorScheme="teal"
            onClick={handleSignUp}
            isLoading={loading}
            isDisabled={!isFormValid}
            w="full"
          >
            Sign Up
          </Button>
          <ChakraLink as={Link} to="/login" color="teal.500">
            Already have an account? Login
          </ChakraLink>
        </VStack>
      </Box>
    </Box>
  );
};

export default SignUp;