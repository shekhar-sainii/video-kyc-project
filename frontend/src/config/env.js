const ENV = {
  AUTH_SERVICE_URL: import.meta.env.DEV
    ? "/api/v1"
    : import.meta.env.VITE_AUTH_SERVICE_URL,
  PRODUCT_SERVICE_URL: import.meta.env.VITE_PRODUCT_SERVICE_URL,
  ORDER_SERVICE_URL: import.meta.env.VITE_ORDER_SERVICE_URL,
  PAYMENT_SERVICE_URL: import.meta.env.VITE_PAYMENT_SERVICE_URL,
};

export default ENV;
