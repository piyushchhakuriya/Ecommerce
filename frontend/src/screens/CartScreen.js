import { useContext } from 'react';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MessageBox from '../components/MessageBox';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);

  const {
    cart: { cartItems },
  } = state;

  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      alert('Sorry. Product is out of stock');
      return;
    }

    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping');
  };

  const itemsCount = cartItems.reduce((a, c) => a + c.quantity, 0);
  const subtotal = cartItems
    .reduce((a, c) => a + c.price * c.quantity, 0)
    .toFixed(2);

  return (
    <div>
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>

      <h1 className="mb-4">Shopping Cart</h1>

      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <MessageBox>
                Cart is empty. <Link to="/">Go Shopping</Link>
              </MessageBox>
            </motion.div>
          ) : (
            <ListGroup variant="flush">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListGroup.Item className="mb-3 shadow-sm rounded">
                      <Row className="align-items-center">
                        <Col md={4} className="d-flex align-items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="img-fluid rounded"
                            style={{ width: '80px', objectFit: 'cover' }}
                          />
                          <Link
                            to={`/product/${item.slug}`}
                            style={{ textDecoration: 'none' }}
                          >
                            {item.name}
                          </Link>
                        </Col>

                        <Col md={3} className="text-center">
                          <Button
                            variant="light"
                            onClick={() =>
                              updateCartHandler(item, item.quantity - 1)
                            }
                            disabled={item.quantity === 1}
                          >
                            −
                          </Button>

                          <span className="mx-3 fw-bold">
                            {item.quantity}
                          </span>

                          <Button
                            variant="light"
                            onClick={() =>
                              updateCartHandler(item, item.quantity + 1)
                            }
                            disabled={
                              item.quantity === item.countInStock
                            }
                          >
                            +
                          </Button>
                        </Col>

                        <Col md={3} className="fw-bold">
                          ${item.price}
                        </Col>

                        <Col md={2} className="text-end">
                          <Button
                            variant="outline-danger"
                            onClick={() => removeItemHandler(item)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ListGroup>
          )}
        </Col>

        <Col md={4}>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card
              className="shadow-lg border-0"
              style={{
                borderRadius: '16px',
                position: 'sticky',
                top: '90px',
              }}
            >
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <h4>
                      Subtotal ({itemsCount} items)
                    </h4>
                    <h3 className="fw-bold">${subtotal}</h3>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <div className="d-grid">
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="primary"
                          size="lg"
                          disabled={cartItems.length === 0}
                          onClick={checkoutHandler}
                        >
                          Proceed to Checkout
                        </Button>
                      </motion.div>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
}
