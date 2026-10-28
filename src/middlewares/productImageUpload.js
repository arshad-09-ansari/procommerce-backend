import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const uploadProductImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new ApiError(400, 'Only JPEG, PNG, and WebP images are allowed'));
    }
    callback(null, true);
  },
});

export const hasValidImageSignature = ({ mimetype, buffer }) => {
  if (!buffer || !allowedTypes.has(mimetype)) return false;
  if (mimetype === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimetype === 'image/png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  return buffer.length >= 12
    && buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP';
};

export const validateProductImage = (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'Image file is required in the "image" field'));
  if (!hasValidImageSignature(req.file)) {
    return next(new ApiError(400, 'Image content does not match its supported image type'));
  }
  next();
};
