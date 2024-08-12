import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';

export function rateLimitedAxios() {
  return axiosRateLimit(
    axios.create({
      baseURL: process.env.SPORTS_API,
    }),
    {
      maxRPS: 100 / 60,
      perMilliseconds: 60000,
    },
  );
}
