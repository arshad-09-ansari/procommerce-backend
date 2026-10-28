import { MulterError } from 'multer';

export default (err, req, res, next) => {
  const isMulterError = err instanceof MulterError;
  const status = err.statusCode || (isMulterError ? (err.code === 'LIMIT_FILE_SIZE' ? 413 : 400) : 500);
  res.status(status).json({
    success: false,
    message: isMulterError && err.code === 'LIMIT_FILE_SIZE'
      ? 'Image must be 5 MB or smaller'
      : err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};