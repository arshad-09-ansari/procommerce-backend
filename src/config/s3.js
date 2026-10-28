import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || process.env.S3_REGION;

export const s3Client = new S3Client({ region });
export const isS3RegionConfigured = Boolean(region);
