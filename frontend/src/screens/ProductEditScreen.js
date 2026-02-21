import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };

    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true };
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false };

    default:
      return state;
  }
};

export default function ProductEditScreen() {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
      loadingUpdate: false,
      loadingUpload: false,
    });

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 0,
    image: '',
    images: [],
    category: '',
    brand: '',
    countInStock: 0,
    description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/products/${productId}`);
        setFormData({
          name: data.name,
          slug: data.slug,
          price: data.price,
          image: data.image,
          images: data.images || [],
          category: data.category,
          brand: data.brand,
          countInStock: data.countInStock,
          description: data.description,
        });
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchData();
  }, [productId]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      dispatch({ type: 'UPDATE_REQUEST' });

      await axios.put(
        `/api/products/${productId}`,
        { _id: productId, ...formData },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL' });
      toast.error(getError(err));
    }
  };

  const uploadFileHandler = async (e, isAdditional = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const bodyFormData = new FormData();
    bodyFormData.append('file', file);

    try {
      dispatch({ type: 'UPLOAD_REQUEST' });

      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      dispatch({ type: 'UPLOAD_SUCCESS' });

      if (isAdditional) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.secure_url],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          image: data.secure_url,
        }));
      }

      toast.success('Image uploaded successfully');
    } catch (err) {
      dispatch({ type: 'UPLOAD_FAIL' });
      toast.error(getError(err));
    }
  };

  const deleteImageHandler = (img) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((x) => x !== img),
    }));
    toast.info('Image removed. Click Update to save changes');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Edit Product</title>
      </Helmet>

      <h1 className="my-3">Edit Product</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Card className="p-3 shadow-sm">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Slug</Form.Label>
                  <Form.Control
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Count In Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="countInStock"
                    value={formData.countInStock}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card>

          {/* Image Section */}
          <Card className="p-3 mt-3 shadow-sm">
            <h5>Main Image</h5>

            {formData.image && (
              <img
                src={formData.image}
                alt="preview"
                className="img-fluid mb-2"
                style={{ maxHeight: '200px' }}
              />
            )}

            <Form.Control
              type="file"
              onChange={(e) => uploadFileHandler(e)}
            />
            {loadingUpload && <LoadingBox />}
          </Card>

          {/* Additional Images */}
          <Card className="p-3 mt-3 shadow-sm">
            <h5>Additional Images</h5>

            <ListGroup>
              {formData.images.map((img) => (
                <ListGroup.Item key={img} className="d-flex justify-content-between align-items-center">
                  <img src={img} alt="" width="50" />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteImageHandler(img)}
                  >
                    Remove
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <Form.Control
              className="mt-2"
              type="file"
              onChange={(e) => uploadFileHandler(e, true)}
            />
          </Card>

          <div className="mt-4">
            <Button type="submit" disabled={loadingUpdate}>
              Update Product
            </Button>
            {loadingUpdate && <LoadingBox />}
          </div>
        </Form>
      )}
    </Container>
  );
}
