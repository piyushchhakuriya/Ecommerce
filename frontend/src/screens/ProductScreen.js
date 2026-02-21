import axios from 'axios';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

import Rating from '../components/Rating';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, product: action.payload };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'REVIEW_REQUEST':
      return { ...state, loadingReview: true };

    case 'REVIEW_SUCCESS':
      return { ...state, loadingReview: false };

    case 'REVIEW_FAIL':
      return { ...state, loadingReview: false };

    default:
      return state;
  }
};

function ProductScreen() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const reviewsRef = useRef();

  const [{ loading, error, product, loadingReview }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
      product: {
        reviews: [],
        images: [],
      },
    });

  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  // Fetch Product
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        setSelectedImage(data.image);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  // Add to Cart
  const addToCartHandler = async () => {
    try {
      const existItem = cart.cartItems.find(
        (x) => x._id === product._id
      );
      const quantity = existItem ? existItem.quantity + qty : qty;

      const { data } = await axios.get(`/api/products/${product._id}`);

      if (data.countInStock < quantity) {
        toast.error('Sorry. Product is out of stock');
        return;
      }

      ctxDispatch({
        type: 'CART_ADD_ITEM',
        payload: { ...product, quantity },
      });

      toast.success('Added to cart');
      navigate('/cart');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  // Submit Review
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!rating || !comment) {
      toast.error('Please enter rating and comment');
      return;
    }

    try {
      dispatch({ type: 'REVIEW_REQUEST' });

      await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({ type: 'REVIEW_SUCCESS' });
      toast.success('Review submitted successfully');

      setRating('');
      setComment('');

      // Refetch product
      const { data } = await axios.get(`/api/products/slug/${slug}`);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });

      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
    } catch (err) {
      dispatch({ type: 'REVIEW_FAIL' });
      toast.error(getError(err));
    }
  };

  if (loading) return <LoadingBox />;
  if (error) return <MessageBox variant="danger">{error}</MessageBox>;

  return (
    <div>
      <Helmet>
        <title>{product.name}</title>
      </Helmet>

      <Row>
        {/* Image Section */}
        <Col md={6}>
          <img
            className="img-fluid rounded"
            src={selectedImage}
            alt={product.name}
          />

          <Row className="mt-3">
            {[product.image, ...product.images].map((img) => (
              <Col xs={3} key={img}>
                <Card
                  className={`p-1 ${
                    selectedImage === img ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedImage(img)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Img src={img} />
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Info Section */}
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>{product.name}</h2>
            </ListGroup.Item>

            <ListGroup.Item>
              <Rating
                rating={product.rating}
                numReviews={product.numReviews}
              />
            </ListGroup.Item>

            <ListGroup.Item>
              Price: <strong>${product.price.toFixed(2)}</strong>
            </ListGroup.Item>

            <ListGroup.Item>
              <strong>Description:</strong>
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>

        {/* Buy Section */}
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Status</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="danger">Out of Stock</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {product.countInStock > 0 && (
                  <>
                    <ListGroup.Item>
                      <Row>
                        <Col>Qty</Col>
                        <Col>
                          <Form.Select
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                          >
                            {[...Array(product.countInStock).keys()].map(
                              (x) => (
                                <option key={x + 1} value={x + 1}>
                                  {x + 1}
                                </option>
                              )
                            )}
                          </Form.Select>
                        </Col>
                      </Row>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <div className="d-grid">
                        <Button onClick={addToCartHandler}>
                          Add to Cart
                        </Button>
                      </div>
                    </ListGroup.Item>
                  </>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reviews */}
      <div className="my-4">
        <h3 ref={reviewsRef}>Customer Reviews</h3>

        {product.reviews.length === 0 && (
          <MessageBox>No reviews yet</MessageBox>
        )}

        <ListGroup className="mb-4">
          {product.reviews.map((review) => (
            <ListGroup.Item key={review._id}>
              <strong>{review.name}</strong>
              <Rating rating={review.rating} />
              <p>{review.createdAt.substring(0, 10)}</p>
              <p>{review.comment}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>

        {userInfo ? (
          <Form onSubmit={submitHandler}>
            <h4>Write a Review</h4>

            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </Form.Select>
            </Form.Group>

            <FloatingLabel label="Comment">
              <Form.Control
                as="textarea"
                style={{ height: '100px' }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </FloatingLabel>

            <Button
              className="mt-3"
              type="submit"
              disabled={loadingReview}
            >
              {loadingReview ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        ) : (
          <MessageBox>
            Please{' '}
            <Link to={`/signin?redirect=/product/${product.slug}`}>
              Sign In
            </Link>{' '}
            to write a review
          </MessageBox>
        )}
      </div>
    </div>
  );
}

export default ProductScreen;
