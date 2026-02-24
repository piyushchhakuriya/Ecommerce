import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
// import { Helmet } from 'react-helmet-async';

// Bootstrap
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { LinkContainer } from 'react-router-bootstrap';

// Context & utils
import { Store } from './Store';
import { getError } from './utils';

// Screens
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import SignupScreen from './screens/SignupScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';
import MapScreen from './screens/MapScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

// Admin Screens
import DashboardScreen from './screens/DashboardScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';

// Components
import SearchBox from './components/SearchBox';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state;

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch categories
 useEffect(() => {
  const fetchCategories = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_URL.replace(/\/$/, '');
      const { data } = await axios.get(`${baseURL}/api/products/categories`);
      setCategories(data);
    } catch (err) {
      toast.error(getError(err));
    }
  };
  fetchCategories();
}, []);

  // Sign out handler
  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };

  return (
    <BrowserRouter>
      <div
        className={`site-container d-flex flex-column ${
          fullBox ? 'full-box' : ''
        } ${sidebarIsOpen ? 'sidebar-active' : ''}`}
      >
        {/* Toast Notifications */}
        <ToastContainer position="bottom-center" limit={1} />

        {/* Header */}
        <header className="sticky-top shadow-sm">
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container fluid>
              <Button
                variant="dark"
                onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
              >
                <i className="fas fa-bars"></i>
              </Button>

              <LinkContainer to="/">
                <Navbar.Brand className="ms-2">Amazona</Navbar.Brand>
              </LinkContainer>

              <Navbar.Toggle aria-controls="navbar-collapse" />
              <Navbar.Collapse id="navbar-collapse">
                <SearchBox />
                <Nav className="ms-auto align-items-center">
                  <Link to="/cart" className="nav-link position-relative">
                    Cart
                    {cart.cartItems.length > 0 && (
                      <Badge
                        pill
                        bg="danger"
                        className="position-absolute top-0 start-100 translate-middle"
                      >
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>

                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id="user-nav-dropdown">
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={signoutHandler}>
                        Sign Out
                      </NavDropdown.Item>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      Sign In
                    </Link>
                  )}

                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown title="Admin" id="admin-nav-dropdown">
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/products">
                        <NavDropdown.Item>Products</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/orders">
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/users">
                        <NavDropdown.Item>Users</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>

        {/* Sidebar */}
        <aside
          className={`side-navbar bg-dark text-white p-3 ${
            sidebarIsOpen ? 'active' : ''
          }`}
        >
          <h6 className="text-uppercase">Categories</h6>
          <Nav className="flex-column">
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={{ pathname: '/search', search: `category=${category}` }}
                  onClick={() => setSidebarIsOpen(false)}
                >
                  <Nav.Link>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </aside>

        {/* Main content */}
        <main className="flex-grow-1">
          <Container className="mt-4">
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<HomeScreen />} />
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/forget-password" element={<ForgetPasswordScreen />} />
              <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MapScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/shipping" element={<ShippingAddressScreen />} />
              <Route path="/payment" element={<PaymentMethodScreen />} />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orderhistory"
                element={
                  <ProtectedRoute>
                    <OrderHistoryScreen />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/product/:id"
                element={
                  <AdminRoute>
                    <ProductEditScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <OrderListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              />
            </Routes>
          </Container>
        </main>

        {/* Footer */}
        <footer className="bg-dark text-white text-center py-3 mt-auto">
          &copy; 2026 Amazona. All rights reserved.
        </footer>
      </div>

      {/* Additional CSS */}
      <style>{`
        .site-container {
          min-height: 100vh;
        }
        .full-box {
          padding: 0;
        }
        .side-navbar {
          position: fixed;
          top: 56px;
          left: -220px;
          width: 220px;
          height: 100%;
          transition: left 0.3s ease-in-out;
          z-index: 1050;
        }
        .side-navbar.active {
          left: 0;
        }
      @media (min-width: 992px) {
  .side-navbar {
    top: 56px;
  }
}
        }
        main {
          margin-left: 0;
          transition: margin-left 0.3s ease-in-out;
        }
        .sidebar-active main {
          margin-left: 220px;
        }
      `}</style>
    </BrowserRouter>
  );
}

export default App;
