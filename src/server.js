import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import connectRedis from './config/redis.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { socketHandler } from './sockets/socketHandler.js';
import allRoutes from './routes/index.js';
import { swaggerDocs } from './config/swagger.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.set('io', io);

await connectDB();
await connectRedis();
await connectRabbitMQ().catch(e => console.log('RabbitMQ not ready yet, will retry', e.message));

swaggerDocs(app);

app.get('/health', (req, res) => res.json({ success: true, message: 'API Running', uptime: process.uptime() }));
app.get('/api/v1/health', (req, res) => res.json({ success: true, db: 'mongo', queue: 'rabbitmq' }));

app.use('/api/v1', allRoutes);

app.use(errorMiddleware);
socketHandler(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server + Socket running on ${PORT}, RabbitMQ UI http://localhost:15672`));