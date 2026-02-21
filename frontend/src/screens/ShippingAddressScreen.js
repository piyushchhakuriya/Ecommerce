import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
import { toast } from 'react-toastify';

export default function ShippingAddressScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    fullBox,
    userInfo,
    cart: { shippingAddress },
  } = state;

  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  const [country, setCountry] = useState(shippingAddress.country || '');

  // 🔥 Redirect if not logged in
  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
  }, [userInfo, navigate]);

  // 🔥 Disable fullbox mode
  useEffect(() => {
    if (fullBox) {
      ctxDispatch({ type: 'SET_FULLBOX_OFF' });
    }
  }, [ctxDispatch, fullBox]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (postalCode.length < 4) {
      toast.error('Please enter valid postal code');
      return;
    }

    const updatedAddress = {
      fullName,
      address,
      city,
      postalCode,
      country,
      location: shippingAddress.location,
    };

    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: updatedAddress,
    });

    localStorage.setItem(
      'shippingAddress',
      JSON.stringify(updatedAddress)
    );

    toast.success('Shipping address saved 🚀');
    navigate('/payment');
  };

  const isFormValid =
    fullName && address && city && postalCode && country;

  return (
    <div>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>

      <CheckoutSteps step1 step2 />

      <div className="container small-container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4 shadow-sm border-0">
            <h2 className="mb-4 text-center fw-bold">
              Shipping Address
            </h2>

            <Form onSubmit={submitHandler}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter full name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Street address"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="Enter city"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Postal Code</Form.Label>
                <Form.Control
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                  placeholder="Postal code"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  placeholder="Country"
                />
              </Form.Group>

              {/* 🔥 Map Section */}
              <div className="mb-3">
                <Button
                  variant="outline-dark"
                  type="button"
                  className="w-100 mb-2"
                  onClick={() => navigate('/map')}
                >
                  Choose Location on Map
                </Button>

                {shippingAddress.location?.lat ? (
                  <div className="text-success small">
                    📍 LAT: {shippingAddress.location.lat} | LNG:{' '}
                    {shippingAddress.location.lng}
                  </div>
                ) : (
                  <div className="text-muted small">
                    No location selected
                  </div>
                )}
              </div>

              <div className="d-grid">
                <Button
                  variant="dark"
                  type="submit"
                  disabled={!isFormValid}
                >
                  Continue to Payment →
                </Button>
              </div>
            </Form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
