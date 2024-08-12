import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';

export function rateLimitedAxios() {
  return axiosRateLimit(
    axios.create({
      baseURL: process.env.SPORTS_API,
    }),
    {
      maxRequests: 100,
      perMilliseconds: 60000,
    },
  );
}
