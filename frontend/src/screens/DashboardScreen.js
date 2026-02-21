import React, { useContext, useEffect, useReducer } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-google-charts';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function DashboardScreen() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    summary: {},
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get('/api/orders/summary', {
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
    fetchData();
  }, [userInfo]);

  const users = summary.users?.[0];
  const orders = summary.orders?.[0];
  const dailyOrders = summary.dailyOrders || [];
  const categories = summary.productCategories || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="mb-4">Dashboard</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          {/* Animated Stats Cards */}
          <Row className="g-4">
            {[
              { title: 'Users', value: users?.numUsers || 0 },
              { title: 'Orders', value: orders?.numOrders || 0 },
              {
                title: 'Total Sales',
                value: `$${orders?.totalSales?.toFixed(2) || 0}`,
              },
            ].map((item, index) => (
              <Col md={4} key={index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card className="shadow-lg border-0 rounded-4 text-center p-3">
                    <Card.Body>
                      <Card.Title style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {item.value}
                      </Card.Title>
                      <Card.Text className="text-muted">
                        {item.title}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Sales Chart */}
          <motion.div
            className="my-5"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="mb-3">Sales Overview</h2>
            {dailyOrders.length === 0 ? (
              <MessageBox>No Sales Data</MessageBox>
            ) : (
              <Card className="shadow border-0 rounded-4 p-3">
                <Chart
                  width="100%"
                  height="400px"
                  chartType="AreaChart"
                  loader={<div>Loading Chart...</div>}
                  data={[
                    ['Date', 'Sales'],
                    ...dailyOrders.map((x) => [x._id, x.sales]),
                  ]}
                  options={{
                    areaOpacity: 0.3,
                    legend: { position: 'bottom' },
                  }}
                />
              </Card>
            )}
          </motion.div>

          {/* Categories Chart */}
          <motion.div
            className="my-5"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="mb-3">Product Categories</h2>
            {categories.length === 0 ? (
              <MessageBox>No Categories Data</MessageBox>
            ) : (
              <Card className="shadow border-0 rounded-4 p-3">
                <Chart
                  width="100%"
                  height="400px"
                  chartType="PieChart"
                  loader={<div>Loading Chart...</div>}
                  data={[
                    ['Category', 'Products'],
                    ...categories.map((x) => [x._id, x.count]),
                  ]}
                  options={{
                    pieHole: 0.4,
                    legend: { position: 'right' },
                  }}
                />
              </Card>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
