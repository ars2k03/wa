import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { ApiKeyService, hashApiKey } from '../src/api_key/api_key.service.js';

describe('ApiKeyService key storage', () => {
  let service: ApiKeyService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: { upsert: vi.fn().mockResolvedValue({}) },
      apiKey: {
        create: vi.fn().mockImplementation(({ data }) => {
          const { keyHash: _keyHash, ...rest } = data;
          return Promise.resolve({ id: 'key-1', ...rest });
        }),
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      },
    };
    service = new ApiKeyService(prismaMock);
  });

  it('stores only the hash and prefix, and returns the full key once', async () => {
    const created = await service.createApiKey({ userId: 'user-1', name: 'Test' });
    const { data, omit } = prismaMock.apiKey.create.mock.calls[0][0];

    expect(created.key).toMatch(/^_ars_2k03_[0-9a-f]{48}$/);
    expect(data.keyHash).toBe(hashApiKey(created.key));
    expect(data.keyPrefix).toBe(created.key.slice(0, 18));
    expect(JSON.stringify(data)).not.toContain(created.key);
    expect(omit).toEqual({ keyHash: true });
  });

  it('never selects the hash when listing keys', async () => {
    await service.getUserApiKeys('user-1');

    expect(prismaMock.apiKey.findMany.mock.calls[0][0].omit).toEqual({ keyHash: true });
  });

  it('looks up a key by its hash', async () => {
    prismaMock.apiKey.findUnique.mockResolvedValue({ id: 'key-1', userId: 'user-1', isActive: true });

    const record = await service.validateApiKey('_ars_2k03_secret');

    expect(prismaMock.apiKey.findUnique.mock.calls[0][0].where).toEqual({
      keyHash: hashApiKey('_ars_2k03_secret'),
    });
    expect(record).not.toHaveProperty('key');
  });

  it('rejects unknown and revoked keys', async () => {
    prismaMock.apiKey.findUnique.mockResolvedValueOnce(null);
    await expect(service.validateApiKey('unknown')).rejects.toThrow(UnauthorizedException);

    prismaMock.apiKey.findUnique.mockResolvedValueOnce({ id: 'key-2', userId: 'user-1', isActive: false });
    await expect(service.validateApiKey('revoked')).rejects.toThrow(UnauthorizedException);
  });

  it('stops accepting a deleted key that was cached', async () => {
    const rawKey = '_ars_2k03_secret';
    const keyHash = hashApiKey(rawKey);
    prismaMock.apiKey.findUnique.mockResolvedValueOnce({ id: 'key-1', userId: 'user-1', isActive: true });
    await service.validateApiKey(rawKey);

    prismaMock.apiKey.findUnique.mockResolvedValueOnce({ id: 'key-1', userId: 'user-1', keyHash });
    await service.deleteApiKey('key-1', 'user-1');

    prismaMock.apiKey.findUnique.mockResolvedValueOnce(null);
    await expect(service.validateApiKey(rawKey)).rejects.toThrow(UnauthorizedException);
  });
});
