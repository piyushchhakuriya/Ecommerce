import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
      };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };

    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };

    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };

    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: action.payload };

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

export default function ProductListScreen() {
  const [
    {
      loading,
      error,
      products = [],
      pages = 1,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });

        const { data } = await axios.get(
          `/api/products/admin?page=${page}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    }

    fetchData();
  }, [page, userInfo, successDelete]);

  const createHandler = async () => {
    if (window.confirm('Create new product?')) {
      try {
        dispatch({ type: 'CREATE_REQUEST' });

        const { data } = await axios.post(
          '/api/products',
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        dispatch({ type: 'CREATE_SUCCESS' });
        toast.success('Product created successfully');

        navigate(`/admin/product/${data.product._id}`);
      } catch (err) {
        dispatch({ type: 'CREATE_FAIL' });
        toast.error(getError(err));
      }
    }
  };

  const deleteHandler = async (product) => {
    if (window.confirm('Delete this product?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST', payload: product._id });

        await axios.delete(`/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'DELETE_SUCCESS' });
        toast.success('Product deleted successfully');
      } catch (err) {
        dispatch({ type: 'DELETE_FAIL' });
        toast.error(getError(err));
      }
    }
  };

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col>
          <h2>Product Management</h2>
        </Col>
        <Col className="text-end">
          <Button onClick={createHandler} disabled={loadingCreate}>
            {loadingCreate ? 'Creating...' : 'Create Product'}
          </Button>
        </Col>
      </Row>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : products.length === 0 ? (
        <MessageBox>No products found</MessageBox>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>PRICE</th>
                  <th>CATEGORY</th>
                  <th>BRAND</th>
                  <th className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product._id.slice(-6)}</td>
                    <td>{product.name}</td>
                    <td>
                      <Badge bg="success">
                        ${product.price.toFixed(2)}
                      </Badge>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          navigate(`/admin/product/${product._id}`)
                        }
                      >
                        Edit
                      </Button>{' '}
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => deleteHandler(product)}
                        disabled={loadingDelete === product._id}
                      >
                        {loadingDelete === product._id
                          ? 'Deleting...'
                          : 'Delete'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-3">
              {[...Array(pages).keys()].map((x) => (
                <Link
                  key={x + 1}
                  className={
                    x + 1 === Number(page)
                      ? 'btn btn-dark mx-1'
                      : 'btn btn-outline-dark mx-1'
                  }
                  to={`/admin/products?page=${x + 1}`}
                >
                  {x + 1}
                </Link>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
