import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Row, Col, Button, ListGroup, Card, Badge } from 'react-bootstrap';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, successPay: false };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return { ...state, successDeliver: false };
    default:
      return state;
  }
}

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      successDeliver,
      loadingDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {
      orderItems: [],
      shippingAddress: {},
    },
    error: '',
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // ---------------- FETCH ORDER ----------------
  useEffect(() => {
  if (!userInfo) {
    navigate('/login');
    return;
  }

  const fetchOrder = async () => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
    }
  };

  if (
    !order._id ||
    successPay ||
    successDeliver ||
    order._id !== orderId
  ) {
    fetchOrder();

    if (successPay) dispatch({ type: 'PAY_RESET' });
    if (successDeliver) dispatch({ type: 'DELIVER_RESET' });
  } else if (!order.isPaid) {
    const loadPaypalScript = async () => {
      const { data: clientId } = await axios.get('/api/keys/paypal', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      paypalDispatch({
        type: 'resetOptions',
        value: {
          'client-id': clientId,
          currency: 'USD',
        },
      });

      paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
    };

    loadPaypalScript();
  }
}, [
  order._id,
  order.isPaid,   // ✅ ADD THIS LINE (important fix)
  orderId,
  userInfo,
  navigate,
  successPay,
  successDeliver,
  paypalDispatch,
]);
  // ---------------- PAYPAL ----------------
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: { value: order.totalPrice.toFixed(2) },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        dispatch({ type: 'PAY_REQUEST' });

        await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        dispatch({ type: 'PAY_SUCCESS' });
        toast.success('Order Paid Successfully');
      } catch (err) {
        dispatch({ type: 'PAY_FAIL' });
        toast.error(getError(err));
      }
    });
  };

  const deliverOrderHandler = async () => {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });

      await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({ type: 'DELIVER_SUCCESS' });
      toast.success('Order Delivered Successfully');
    } catch (err) {
      dispatch({ type: 'DELIVER_FAIL' });
      toast.error(getError(err));
    }
  };

  // ---------------- UI ----------------
  if (loading) return <LoadingBox />;
  if (error) return <MessageBox variant="danger">{error}</MessageBox>;

  return (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>

      <h2 className="my-3">
        Order #{orderId}{' '}
        {order.isPaid ? (
          <Badge bg="success">Paid</Badge>
        ) : (
          <Badge bg="danger">Unpaid</Badge>
        )}
      </h2>

      <Row>
        <Col md={8}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>Shipping Details</Card.Title>
              <p>
                <strong>Name:</strong> {order.shippingAddress?.fullName}
                <br />
                <strong>Address:</strong>{' '}
                {order.shippingAddress?.address},{' '}
                {order.shippingAddress?.city},{' '}
                {order.shippingAddress?.postalCode},{' '}
                {order.shippingAddress?.country}
              </p>
            </Card.Body>
          </Card>

          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>Order Items</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row>
                      <Col md={6}>
                        <Link to={`/product/${item.slug}`}>
                          {item.name}
                        </Link>
                      </Col>
                      <Col md={3}>{item.quantity}</Col>
                      <Col md={3}>${item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  Total: <strong>${order.totalPrice?.toFixed(2)}</strong>
                </ListGroup.Item>

                {!order.isPaid && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      <PayPalButtons
                        createOrder={createOrder}
                        onApprove={onApprove}
                      />
                    )}
                    {loadingPay && <LoadingBox />}
                  </ListGroup.Item>
                )}

                {userInfo?.isAdmin &&
                  order.isPaid &&
                  !order.isDelivered && (
                    <ListGroup.Item>
                      {loadingDeliver && <LoadingBox />}
                      <Button
                        type="button"
                        className="w-100"
                        onClick={deliverOrderHandler}
                      >
                        Deliver Order
                      </Button>
                    </ListGroup.Item>
                  )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
