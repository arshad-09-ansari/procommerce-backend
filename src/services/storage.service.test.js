import { describe, expect, it, jest } from '@jest/globals';
import { createStorageService } from './storage.service.js';

const imageId = 'c0a80123-4567-489a-8abc-1234567890ab';
const image = { buffer: Buffer.from('image bytes'), mimetype: 'image/png' };

describe('S3 image storage', () => {
  it('uploads images with a generated key and private encryption settings', async () => {
    const send = jest.fn().mockResolvedValue({});
    const storage = createStorageService({
      client: { send },
      bucket: 'private-products',
      createId: () => imageId,
    });

    await expect(storage.uploadImage(image)).resolves.toEqual({
      imageId,
      key: `products/${imageId}`,
    });
    expect(send.mock.calls[0][0].input).toMatchObject({
      Bucket: 'private-products',
      Key: `products/${imageId}`,
      Body: image.buffer,
      ContentType: 'image/png',
      ServerSideEncryption: 'AES256',
    });
  });

  it('creates a short-lived signed URL for a valid private image key', async () => {
    const signGetUrl = jest.fn().mockResolvedValue('https://signed.example/image');
    const storage = createStorageService({
      client: { send: jest.fn() },
      bucket: 'private-products',
      signGetUrl,
      expirationSeconds: 300,
    });

    await expect(storage.getImageUrl(imageId)).resolves.toBe('https://signed.example/image');
    expect(signGetUrl.mock.calls[0][1].input).toEqual({
      Bucket: 'private-products',
      Key: `products/${imageId}`,
    });
    expect(signGetUrl.mock.calls[0][2]).toEqual({ expiresIn: 300 });
  });

  it('fails explicitly when the bucket is missing or the image id is invalid', async () => {
    const unconfigured = createStorageService({ client: { send: jest.fn() }, bucket: '' });
    await expect(unconfigured.uploadImage(image)).rejects.toMatchObject({
      statusCode: 503,
      message: 'S3 storage is not configured',
    });

    const configured = createStorageService({ client: { send: jest.fn() }, bucket: 'private-products' });
    await expect(configured.getImageUrl('not-an-id')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid image id',
    });
  });

  it('rejects signed URL expirations outside the AWS-supported window', async () => {
    const storage = createStorageService({
      client: { send: jest.fn() },
      bucket: 'private-products',
      expirationSeconds: 10,
    });

    await expect(storage.getImageUrl(imageId)).rejects.toMatchObject({ statusCode: 500 });
  });
});
