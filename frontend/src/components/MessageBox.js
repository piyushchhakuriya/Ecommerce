import Alert from 'react-bootstrap/Alert';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function MessageBox({
  variant = 'info',
  children,
  dismissible = true,
  autoClose = false,
  duration = 3000,
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return 'fas fa-check-circle';
      case 'danger':
        return 'fas fa-times-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-info-circle';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Alert
            variant={variant}
            dismissible={dismissible}
            onClose={() => setShow(false)}
            className="d-flex align-items-center gap-2 shadow-sm"
            style={{ borderRadius: '12px' }}
          >
            <i className={getIcon()} style={{ fontSize: '1.2rem' }}></i>
            <div>{children}</div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
