import express from 'express';
import request from 'supertest';
import { describe, expect, it } from '@jest/globals';
import productRoutes from './product.routes.js';
import errorMiddleware from '../middlewares/errorMiddleware.js';

describe('product image upload route', () => {
  it('requires authentication before accepting an image upload', async () => {
    const app = express();
    app.use('/products', productRoutes);
    app.use(errorMiddleware);

    const response = await request(app)
      .post('/products/images')
      .attach('image', Buffer.from('not sent without authentication'), {
        filename: 'image.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false, message: 'Not authorized, no token' });
  });
});
