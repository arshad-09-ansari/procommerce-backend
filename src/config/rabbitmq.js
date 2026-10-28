import amqplib from 'amqplib';
let channel, connection;
export const connectRabbitMQ = async () => {
  connection = await amqplib.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue('EMAIL_QUEUE', { durable: true });
  await channel.assertQueue('ORDER_QUEUE', { durable: true });
  await channel.assertQueue('PAYMENT_QUEUE', { durable: true });
  console.log('RabbitMQ Connected & Queues Asserted');
  return channel;
};
export const getChannel = () => channel;
export const publishToQueue = async (queue, data) => {
  if (!channel) return console.log('No channel');
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });
};