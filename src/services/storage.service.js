import { randomUUID } from 'node:crypto';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { isS3RegionConfigured, s3Client } from '../config/s3.js';
import { ApiError } from '../utils/ApiError.js';

const IMAGE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createStorageService = ({
  client = s3Client,
  bucket = process.env.S3_BUCKET,
  signGetUrl = getSignedUrl,
  expirationSeconds = Number(process.env.S3_SIGNED_URL_TTL_SECONDS || 300),
  createId = randomUUID,
} = {}) => {
  const requireBucket = () => {
    if (!bucket) throw new ApiError(503, 'S3 storage is not configured');
    if (client === s3Client && !isS3RegionConfigured) {
      throw new ApiError(503, 'AWS_REGION must be configured for S3 storage');
    }
  };

  const requireExpiration = () => {
    if (!Number.isInteger(expirationSeconds) || expirationSeconds < 60 || expirationSeconds > 3600) {
      throw new ApiError(500, 'S3_SIGNED_URL_TTL_SECONDS must be an integer between 60 and 3600');
    }
  };

  return {
    async uploadImage(file) {
      requireBucket();
      if (!file?.buffer || !file.mimetype) throw new ApiError(400, 'A valid image file is required');

      const imageId = createId();
      const key = `products/${imageId}`;
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256',
        CacheControl: 'private, max-age=0, no-cache',
      }));

      return { imageId, key };
    },

    async getImageUrl(imageId) {
      requireBucket();
      requireExpiration();
      if (!IMAGE_ID_PATTERN.test(imageId)) throw new ApiError(400, 'Invalid image id');

      return signGetUrl(
        client,
        new GetObjectCommand({ Bucket: bucket, Key: `products/${imageId}` }),
        { expiresIn: expirationSeconds },
      );
    },
  };
};

const storageService = createStorageService();
export default storageService;
