import ENV from '../../config/env';
import createAxiosInstance from './axiosBase';

const authAxios = createAxiosInstance(
  ENV.AUTH_SERVICE_URL
);

export default authAxios;
