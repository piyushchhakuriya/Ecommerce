import Axios from 'axios';
import { useContext, useEffect, useState, useReducer } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'RESET_REQUEST':
      return { ...state, loading: true };
    case 'RESET_SUCCESS':
      return { ...state, loading: false };
    case 'RESET_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo || !token) {
      navigate('/');
    }
  }, [navigate, userInfo, token]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      dispatch({ type: 'RESET_REQUEST' });

      await Axios.post('/api/users/reset-password', {
        password,
        token,
      });

      dispatch({ type: 'RESET_SUCCESS' });

      toast.success('Password updated successfully 🚀');
      navigate('/signin');
    } catch (err) {
      dispatch({ type: 'RESET_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Reset Password</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="my-4 text-center fw-bold">Reset Password</h1>

        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter new password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Confirm new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="Show Password"
            className="mb-3"
            onChange={() => setShowPassword(!showPassword)}
          />

          <div className="d-grid">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </div>
        </Form>
      </motion.div>
    </Container>
  );
}
