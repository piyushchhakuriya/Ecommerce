import React, { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Rating from '../components/Rating';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Product from '../components/Product';
import LinkContainer from 'react-router-bootstrap/LinkContainer';
import { motion } from 'framer-motion';

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
        countProducts: action.payload.countProducts,
      };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default function SearchScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);

  const category = sp.get('category') || 'all';
  const query = sp.get('query') || 'all';
  const price = sp.get('price') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';
  const page = sp.get('page') || 1;

  const [{ loading, error, products = [], pages = 0, countProducts = 0 }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const [categories, setCategories] = useState([]);

  // 🔥 Fetch Products
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });

        const { data } = await axios.get(
          `/api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
        );

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };

    fetchData();
  }, [category, order, page, price, query, rating]);

  // 🔥 Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  const getFilterUrl = (filter, skipPathname) => {
    return `${
      skipPathname ? '' : '/search?'
    }category=${filter.category || category}&query=${
      filter.query || query
    }&price=${filter.price || price}&rating=${
      filter.rating || rating
    }&order=${filter.order || order}&page=${filter.page || page}`;
  };

  return (
    <div>
      <Helmet>
        <title>Search Products</title>
      </Helmet>

      <Row>
        {/* 🔥 Sidebar */}
        <Col md={3}>
          <h4 className="fw-bold mb-3">Filters</h4>

          <div className="mb-4">
            <h6>Department</h6>
            <ul className="list-unstyled">
              <li>
                <Link to={getFilterUrl({ category: 'all' })}>
                  Any
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link to={getFilterUrl({ category: c })}>{c}</Link>
                </li>
              ))}
            </ul>
          </div>
        </Col>

        {/* 🔥 Products Section */}
        <Col md={9}>
          {loading ? (
            <LoadingBox />
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row className="justify-content-between mb-3">
                <Col>
                  <strong>{countProducts}</strong> Results
                </Col>

                <Col className="text-end">
                  <select
                    value={order}
                    onChange={(e) =>
                      navigate(getFilterUrl({ order: e.target.value }))
                    }
                  >
                    <option value="newest">Newest</option>
                    <option value="lowest">Price Low → High</option>
                    <option value="highest">Price High → Low</option>
                    <option value="toprated">Top Rated</option>
                  </select>
                </Col>
              </Row>

              {products.length === 0 && (
                <MessageBox>No Product Found</MessageBox>
              )}

              <Row>
                {products.map((product) => (
                  <Col sm={6} lg={4} className="mb-4" key={product._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Product product={product} />
                    </motion.div>
                  </Col>
                ))}
              </Row>

              {/* 🔥 Pagination */}
              <div className="text-center mt-4">
                {[...Array(pages).keys()].map((x) => (
                  <LinkContainer
                    key={x + 1}
                    to={{
                      pathname: '/search',
                      search: getFilterUrl({ page: x + 1 }, true),
                    }}
                  >
                    <Button
                      variant={
                        Number(page) === x + 1 ? 'dark' : 'light'
                      }
                      className="mx-1"
                    >
                      {x + 1}
                    </Button>
                  </LinkContainer>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
