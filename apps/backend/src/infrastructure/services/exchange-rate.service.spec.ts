import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateService } from './exchange-rate.service';
import { RedisCacheService } from '../cache/redis-cache.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRateService,
        {
          provide: RedisCacheService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ExchangeRateService>(ExchangeRateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getExchangeRate', () => {
    it('should return 1 if from and to currencies are the same', async () => {
      const rate = await service.getExchangeRate('USD', 'USD');
      expect(rate).toBe(1);
    });

    it('should return cached rate if available and fresh (< 1h)', async () => {
      mockRedisService.get.mockResolvedValue({
        rate: 5.5,
        timestamp: Date.now() - 1000,
      });

      const rate = await service.getExchangeRate('USD', 'BRL');
      expect(rate).toBe(5.5);
      expect(mockRedisService.get).toHaveBeenCalled();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should handle legacy numeric cache (treat as valid)', async () => {
      mockRedisService.get.mockResolvedValue(5.5);
      const rate = await service.getExchangeRate('USD', 'BRL');
      expect(rate).toBe(5.5);
    });

    it('should fetch from API if cache is stale (> 1h)', async () => {
      mockRedisService.get.mockResolvedValue({
        rate: 5.0,
        timestamp: Date.now() - (3600 * 1000 + 1000),
      });

      mockedAxios.get.mockResolvedValue({
        data: {
          usd: {
            brl: 5.6,
          },
        },
      });

      const rate = await service.getExchangeRate('USD', 'BRL');
      expect(rate).toBe(5.6);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        expect.stringContaining('exchange_rate:usd:brl'),
        expect.objectContaining({ rate: 5.6 }),
        expect.any(Number),
      );
    });

    it('should return STALE rate if API fetch fails (fallback)', async () => {
      const staleTimestamp = Date.now() - 3600 * 1000 * 24;
      mockRedisService.get.mockResolvedValue({
        rate: 5.0,
        timestamp: staleTimestamp,
      });

      mockedAxios.get.mockRejectedValue(new Error('API Down'));

      const rate = await service.getExchangeRate('USD', 'BRL');
      expect(rate).toBe(5.0);
    }, 30000);

    it('should return null if no cache (fresh or stale) and API fails', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockedAxios.get.mockRejectedValue(new Error('API Down'));

      const rate = await service.getExchangeRate('USD', 'BRL');
      expect(rate).toBeNull();
    }, 30000);

    it('should fetch historical rate if date is provided', async () => {
      const date = new Date('2024-01-15');
      const dateStr = '2024-01-15';

      mockRedisService.get.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({
        data: {
          usd: {
            brl: 4.8,
          },
        },
      });

      const rate = await service.getExchangeRate('USD', 'BRL', date);
      expect(rate).toBe(4.8);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(dateStr),
        expect.objectContaining({ timeout: 10000 }),
      );
    });
  });

  describe('convertAmount', () => {
    it('should convert amount correctly', async () => {
      jest.spyOn(service, 'getExchangeRate').mockResolvedValue(2);

      const result = await service.convertAmount(100, 'USD', 'BRL');
      expect(result).toBe(200);
    });
  });
});
