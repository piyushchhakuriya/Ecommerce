import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import { useContext, useState } from 'react';
import { Store } from '../Store';
import { motion } from 'framer-motion';

function Product({ product }) {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const [loading, setLoading] = useState(false);

  const addToCartHandler = async (item) => {
    try {
      setLoading(true);

      const existItem = cartItems.find((x) => x._id === product._id);
      const quantity = existItem ? existItem.quantity + 1 : 1;

      const { data } = await axios.get(`/api/products/${item._id}`);

      if (data.countInStock < quantity) {
        alert('Sorry. Product is out of stock');
        setLoading(false);
        return;
      }

      ctxDispatch({
        type: 'CART_ADD_ITEM',
        payload: { ...item, quantity },
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert('Something went wrong');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <Card
        className="shadow-sm border-0 h-100"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {product.countInStock === 0 && (
            <Badge
              bg="danger"
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 2,
              }}
            >
              Out of Stock
            </Badge>
          )}

          <Link to={`/product/${product.slug}`}>
            <motion.img
              src={product.image}
              alt={product.name}
              className="card-img-top"
              style={{
                height: '260px',
                objectFit: 'cover',
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
            />
          </Link>
        </div>

        <Card.Body className="d-flex flex-column">
          <Link
            to={`/product/${product.slug}`}
            style={{ textDecoration: 'none', color: 'black' }}
          >
            <Card.Title
              style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                minHeight: '48px',
              }}
            >
              {product.name}
            </Card.Title>
          </Link>

          <Rating rating={product.rating} numReviews={product.numReviews} />

          <Card.Text
            style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginTop: '8px',
            }}
          >
            ${product.price}
          </Card.Text>

          <div className="mt-auto">
            {product.countInStock === 0 ? (
              <Button variant="secondary" disabled className="w-100">
                Out of Stock
              </Button>
            ) : (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => addToCartHandler(product)}
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Adding...
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
}

export default Product;
