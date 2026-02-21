import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { motion } from 'framer-motion';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      dispatch({ type: 'UPDATE_REQUEST' });

      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({ type: 'UPDATE_SUCCESS' });

      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));

      toast.success('Profile updated successfully 🚀');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <div className="container small-container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="my-4 text-center fw-bold">User Profile</h1>

        <Form onSubmit={submitHandler}>

          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </Form.Group>

          <div className="d-grid">
            <Button type="submit" disabled={loadingUpdate}>
              {loadingUpdate ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </div>
        </Form>
      </motion.div>
    </div>
  );
}
