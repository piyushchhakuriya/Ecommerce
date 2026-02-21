import React, { useContext, useEffect, useReducer } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function OrderHistoryScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders = [] }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    orders: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get('/api/orders/mine', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [userInfo]);

  return (
    <Container className="py-4">
      <Helmet>
        <title>Order History</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4">Order History</h1>

        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : orders.length === 0 ? (
          <MessageBox>No orders found</MessageBox>
        ) : (
          orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="mb-3"
            >
              <Card className="shadow-sm border-0 rounded-4">
                <Card.Body>
                  <div className="d-flex justify-content-between flex-wrap gap-3">

                    <div>
                      <strong>Order ID:</strong>
                      <div className="text-muted small">
                        {order._id}
                      </div>
                    </div>

                    <div>
                      <strong>Date:</strong>
                      <div>
                        {order.createdAt
                          ? order.createdAt.substring(0, 10)
                          : '-'}
                      </div>
                    </div>

                    <div>
                      <strong>Total:</strong>
                      <div>${order.totalPrice.toFixed(2)}</div>
                    </div>

                    <div>
                      <strong>Payment:</strong>
                      <div>
                        {order.isPaid ? (
                          <Badge bg="success">
                            Paid
                          </Badge>
                        ) : (
                          <Badge bg="danger">
                            Unpaid
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <strong>Delivery:</strong>
                      <div>
                        {order.isDelivered ? (
                          <Badge bg="success">
                            Delivered
                          </Badge>
                        ) : (
                          <Badge bg="warning">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <Button
                        variant="outline-primary"
                        onClick={() =>
                          navigate(`/order/${order._id}`)
                        }
                      >
                        View Details
                      </Button>
                    </div>

                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </Container>
  );
}
