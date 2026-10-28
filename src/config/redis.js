import Redis from 'ioredis';
let redisClient;
const connectRedis = async () => {
  redisClient = new Redis(process.env.REDIS_URL);
  redisClient.on('connect', () => console.log('Redis Connected'));
  redisClient.on('error', (e) => console.log('Redis Error', e.message));
  return redisClient;
};
export const getRedis = () => redisClient;
export default connectRedis;