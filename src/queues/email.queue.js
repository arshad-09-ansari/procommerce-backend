import { publishToQueue } from '../config/rabbitmq.js';
export const sendEmailJob = async (data) => {
  await publishToQueue('EMAIL_QUEUE', data);
};