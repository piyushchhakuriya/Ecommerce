import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, successDelete: false };
    default:
      return state;
  }
};

export default function OrderListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
      orders: [],
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    }

    fetchData();
  }, [userInfo, successDelete]);

  const deleteHandler = async (order) => {
    if (window.confirm('Are you sure to delete this order?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Order deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  return (
    <Container className="py-4">
      <Helmet>
        <title>Orders</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="mb-4">Orders</h1>

        {loadingDelete && <LoadingBox />}

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
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="mb-3"
            >
              <Card className="shadow-sm border-0 rounded-4">
                <Card.Body className="d-flex flex-wrap justify-content-between gap-3">

                  <div>
                    <strong>ID:</strong>
                    <div className="text-muted small">
                      {order._id}
                    </div>
                  </div>

                  <div>
                    <strong>User:</strong>
                    <div>
                      {order.user?.name || 'Deleted User'}
                    </div>
                  </div>

                  <div>
                    <strong>Total:</strong>
                    <div>${order.totalPrice.toFixed(2)}</div>
                  </div>

                  <div>
                    <strong>Paid:</strong>
                    <div>
                      {order.isPaid ? (
                        <Badge bg="success">Paid</Badge>
                      ) : (
                        <Badge bg="danger">No</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <strong>Delivered:</strong>
                    <div>
                      {order.isDelivered ? (
                        <Badge bg="success">Delivered</Badge>
                      ) : (
                        <Badge bg="warning">Pending</Badge>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        navigate(`/order/${order._id}`)
                      }
                    >
                      Details
                    </Button>

                    <Button
                      variant="outline-danger"
                      onClick={() => deleteHandler(order)}
                    >
                      Delete
                    </Button>
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
