import dotenv from 'dotenv';
import amqplib from 'amqplib';
import mongoose from 'mongoose';
dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
console.log('Worker Mongo Connected');

const conn = await amqplib.connect(process.env.RABBITMQ_URL);
const channel = await conn.createChannel();
await channel.assertQueue('EMAIL_QUEUE', { durable: true });
await channel.assertQueue('ORDER_QUEUE', { durable: true });
await channel.assertQueue('PAYMENT_QUEUE', { durable: true });

console.log('Worker waiting for messages...');

channel.consume('EMAIL_QUEUE', async (msg) => {
  if (msg) {
    const data = JSON.parse(msg.content.toString());
    console.log('📧 Processing Email Job:', data);
    // Simulate email sending
    await new Promise(r => setTimeout(r, 1000));
    channel.ack(msg);
  }
});
channel.consume('ORDER_QUEUE', async (msg) => {
  if (msg) {
    const data = JSON.parse(msg.content.toString());
    console.log('📦 Processing Order Job:', data);
    await new Promise(r => setTimeout(r, 1500));
    channel.ack(msg);
  }
});
channel.consume('PAYMENT_QUEUE', async (msg) => {
  if (msg) {
    const data = JSON.parse(msg.content.toString());
    console.log('💰 Processing Payment Success Job:', data);
    channel.ack(msg);
  }
});