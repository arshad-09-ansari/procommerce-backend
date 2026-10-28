import { describe, expect, it } from '@jest/globals';
import { hasValidImageSignature } from './productImageUpload.js';

describe('product image validation', () => {
  it('accepts supported image signatures', () => {
    expect(hasValidImageSignature({
      mimetype: 'image/jpeg',
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0x00]),
    })).toBe(true);
    expect(hasValidImageSignature({
      mimetype: 'image/png',
      buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    })).toBe(true);
    expect(hasValidImageSignature({
      mimetype: 'image/webp',
      buffer: Buffer.from('RIFF0000WEBP'),
    })).toBe(true);
  });

  it('rejects MIME-type spoofing and unsupported formats', () => {
    expect(hasValidImageSignature({
      mimetype: 'image/png',
      buffer: Buffer.from('not a PNG'),
    })).toBe(false);
    expect(hasValidImageSignature({
      mimetype: 'image/svg+xml',
      buffer: Buffer.from('<svg />'),
    })).toBe(false);
  });
});
