import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { motion } from 'framer-motion';
import Spinner from 'react-bootstrap/Spinner';

export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      const { data } = await Axios.post('/api/users/signin', {
        email,
        password,
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Signed in successfully 🚀');
      navigate(redirect || '/');
    } catch (err) {
      toast.error(getError(err));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const isFormValid = email && password;

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign In</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 shadow-sm border rounded"
      >
        <h1 className="my-3 text-center fw-bold">Sign In</h1>

        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <div className="mb-3 d-grid">
            <Button
              type="submit"
              variant="dark"
              disabled={!isFormValid || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>

          <div className="mb-2 text-center">
            New customer?{' '}
            <Link to={`/signup?redirect=${redirect}`}>
              Create your account
            </Link>
          </div>
          <div className="text-center">
            Forgot Password? <Link to={`/forget-password`}>Reset</Link>
          </div>
        </Form>
      </motion.div>
    </Container>
  );
}
