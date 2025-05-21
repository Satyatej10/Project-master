import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { setUser } from './redux/authSlice';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

const serializeUser = (user) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName || null,
  photoURL: user.photoURL || null,
});

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isAuthLoading = useSelector((state) => state.auth.isAuthLoading);

  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const dispatch = useDispatch();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Initialize auth state and persist Firebase login
  useEffect(() => {
    // Check for persisted user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      dispatch(setUser(JSON.parse(storedUser)));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const serializedUser = serializeUser(user);
        dispatch(setUser(serializedUser));
      } else {
        dispatch(setUser(null));
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;