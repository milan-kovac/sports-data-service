import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';

export function rateLimitedAxios() {
  return axiosRateLimit(
    axios.create({
      baseURL: process.env.SPORTS_API,
    }),
    {
      maxRPS: 0.0167,
      perMilliseconds: 60000,
    },
  );
}
