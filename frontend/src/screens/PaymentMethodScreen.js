import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';

export default function PaymentMethodScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);

  const {
    cart: { shippingAddress, paymentMethod },
  } = state;

  const [paymentMethodName, setPaymentMethodName] = useState(
    paymentMethod || 'PayPal'
  );

  useEffect(() => {
    if (!shippingAddress?.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (!paymentMethodName) return;

    ctxDispatch({
      type: 'SAVE_PAYMENT_METHOD',
      payload: paymentMethodName,
    });

    localStorage.setItem('paymentMethod', paymentMethodName);
    navigate('/placeorder');
  };

  return (
    <div>
      <Helmet>
        <title>Select Payment Method</title>
      </Helmet>

      <CheckoutSteps step1 step2 step3 />

      <div className="container small-container">
        <h2 className="my-4 text-center">Choose Your Payment Method</h2>

        <Form onSubmit={submitHandler}>
          <Row className="g-3">

            {/* PayPal */}
            <Col md={6}>
              <Card
                className={`p-3 shadow-sm cursor-pointer ${
                  paymentMethodName === 'PayPal'
                    ? 'border-primary'
                    : ''
                }`}
                onClick={() => setPaymentMethodName('PayPal')}
              >
                <Form.Check
                  type="radio"
                  id="PayPal"
                  label="PayPal (Recommended)"
                  value="PayPal"
                  checked={paymentMethodName === 'PayPal'}
                  onChange={(e) => setPaymentMethodName(e.target.value)}
                />
                <small className="text-muted">
                  Secure online payment via PayPal.
                </small>
              </Card>
            </Col>

            {/* Stripe */}
            <Col md={6}>
              <Card
                className={`p-3 shadow-sm cursor-pointer ${
                  paymentMethodName === 'Stripe'
                    ? 'border-primary'
                    : ''
                }`}
                onClick={() => setPaymentMethodName('Stripe')}
              >
                <Form.Check
                  type="radio"
                  id="Stripe"
                  label="Stripe"
                  value="Stripe"
                  checked={paymentMethodName === 'Stripe'}
                  onChange={(e) => setPaymentMethodName(e.target.value)}
                />
                <small className="text-muted">
                  Pay using Credit/Debit Card securely.
                </small>
              </Card>
            </Col>

            {/* COD Example (Future Ready) */}
            <Col md={6}>
              <Card
                className={`p-3 shadow-sm cursor-pointer ${
                  paymentMethodName === 'COD'
                    ? 'border-primary'
                    : ''
                }`}
                onClick={() => setPaymentMethodName('COD')}
              >
                <Form.Check
                  type="radio"
                  id="COD"
                  label="Cash on Delivery"
                  value="COD"
                  checked={paymentMethodName === 'COD'}
                  onChange={(e) => setPaymentMethodName(e.target.value)}
                />
                <small className="text-muted">
                  Pay when product is delivered.
                </small>
              </Card>
            </Col>

          </Row>

          <div className="d-grid mt-4">
            <Button
              type="submit"
              size="lg"
              disabled={!paymentMethodName}
            >
              Continue
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
