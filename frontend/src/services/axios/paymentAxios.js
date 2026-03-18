import ENV from '../../config/env';
import createAxiosInstance from './axiosBase';

const paymentAxios = createAxiosInstance(
  ENV.PAYMENT_SERVICE_URL
);

export default paymentAxios;
