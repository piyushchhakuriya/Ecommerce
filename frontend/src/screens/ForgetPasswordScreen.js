import Axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';

export default function ForgetPasswordScreen() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await Axios.post('/api/users/forget-password', {
        email,
      });
      setSuccess(true);
      toast.success(data.message);
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="small-container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Helmet>
        <title>Forget Password</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <Card className="shadow-lg border-0 rounded-4 p-4">
          <Card.Body>
            <h2 className="text-center mb-4">Forgot Password</h2>

            {success ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="mb-3 text-success" style={{ fontSize: '3rem' }}>
                  ✓
                </div>
                <p>
                  If an account with that email exists, you will receive
                  password reset instructions.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/signin')}
                >
                  Back to Sign In
                </Button>
              </motion.div>
            ) : (
              <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
}
