import Axios from 'axios';
import React, { useContext, useEffect, useMemo, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, ListGroup, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
import LoadingBox from '../components/LoadingBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();
  const [{ loading }, dispatch] = useReducer(reducer, { loading: false });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  // ---------------- PRICE CALCULATION ----------------
  const round2 = (num) =>
    Math.round((num + Number.EPSILON) * 100) / 100;

  const pricing = useMemo(() => {
    const itemsPrice = round2(
      cart.cartItems.reduce(
        (a, c) => a + c.quantity * c.price,
        0
      )
    );

    const shippingPrice =
      itemsPrice > 100 ? round2(0) : round2(10);

    const taxPrice = round2(0.15 * itemsPrice);

    const totalPrice =
      itemsPrice + shippingPrice + taxPrice;

    return {
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    };
  }, [cart.cartItems]);

  // ---------------- VALIDATION ----------------
  useEffect(() => {
    if (!cart.paymentMethod) navigate('/payment');
    if (cart.cartItems.length === 0) navigate('/cart');
  }, [cart, navigate]);

  // ---------------- PLACE ORDER ----------------
  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          ...pricing,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      dispatch({ type: 'CREATE_SUCCESS' });
      ctxDispatch({ type: 'CART_CLEAR' });
      localStorage.removeItem('cartItems');

      toast.success('Order Placed Successfully 🚀');

      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  // ---------------- UI ----------------
  return (
    <div>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>

      <CheckoutSteps step1 step2 step3 step4 />

      <h2 className="my-4 text-center">Review Your Order</h2>

      <Row>
        {/* LEFT SIDE */}
        <Col md={8}>
          {/* Shipping */}
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>Shipping Details</Card.Title>
              <p>
                <strong>Name:</strong>{' '}
                {cart.shippingAddress?.fullName}
                <br />
                <strong>Address:</strong>{' '}
                {cart.shippingAddress?.address},{' '}
                {cart.shippingAddress?.city},{' '}
                {cart.shippingAddress?.postalCode},{' '}
                {cart.shippingAddress?.country}
              </p>
              <Link to="/shipping">Edit</Link>
            </Card.Body>
          </Card>

          {/* Payment */}
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>Payment Method</Card.Title>
              <p>
                <strong>{cart.paymentMethod}</strong>
              </p>
              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          {/* Items */}
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>Order Items</Card.Title>

              {cart.cartItems.length === 0 ? (
                <Alert variant="info">
                  Your cart is empty
                </Alert>
              ) : (
                <ListGroup variant="flush">
                  {cart.cartItems.map((item) => (
                    <ListGroup.Item key={item._id}>
                      <Row className="align-items-center">
                        <Col md={6}>
                          <Link to={`/product/${item.slug}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={3}>
                          {item.quantity} x ${item.price}
                        </Col>
                        <Col md={3}>
                          $
                          {(
                            item.quantity * item.price
                          ).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              <Link to="/cart">Edit</Link>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT SIDE */}
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  Items: ${pricing.itemsPrice.toFixed(2)}
                </ListGroup.Item>

                <ListGroup.Item>
                  Shipping: $
                  {pricing.shippingPrice.toFixed(2)}
                </ListGroup.Item>

                <ListGroup.Item>
                  Tax: ${pricing.taxPrice.toFixed(2)}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>
                    Total: $
                    {pricing.totalPrice.toFixed(2)}
                  </strong>
                </ListGroup.Item>

                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      size="lg"
                      onClick={placeOrderHandler}
                      disabled={
                        cart.cartItems.length === 0 ||
                        loading
                      }
                    >
                      {loading
                        ? 'Placing Order...'
                        : 'Place Order'}
                    </Button>
                  </div>

                  {loading && <LoadingBox />}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
