import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

export default function SearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const submitHandler = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      navigate(`/search/?query=${trimmedQuery}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <Form className="d-flex me-auto position-relative" onSubmit={submitHandler}>
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: isFocused ? 1.03 : 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        style={{ width: '100%' }}
      >
        <InputGroup>
          <FormControl
            type="text"
            name="q"
            id="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for products, brands and more..."
            aria-label="Search Products"
            aria-describedby="button-search"
            style={{
              borderRadius: '30px 0 0 30px',
              paddingLeft: '20px',
              boxShadow: isFocused
                ? '0 0 10px rgba(13,110,253,0.5)'
                : 'none',
              transition: 'all 0.3s ease',
            }}
          />

          <motion.div
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <Button
              variant="primary"
              type="submit"
              id="button-search"
              style={{
                borderRadius: '0 30px 30px 0',
                paddingLeft: '18px',
                paddingRight: '18px',
              }}
            >
              <motion.i
                className="fas fa-search"
                animate={{ rotate: isFocused ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              ></motion.i>
            </Button>
          </motion.div>
        </InputGroup>
      </motion.div>
    </Form>
  );
}
