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

    it('should return cached rate if available', async () => {
      mockRedisService.get.mockResolvedValue(5.5);
      const rate = await service.getExchangeRate('USD', 'BRL');
      expect(rate).toBe(5.5);
      expect(mockRedisService.get).toHaveBeenCalledWith('exchange_rate:usd:brl:latest');
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should fetch from API if not cached', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({
        data: {
          date: '2024-01-01',
          usd: {
            brl: 5.5,
          },
        },
      });

      const rate = await service.getExchangeRate('USD', 'BRL');
      expect(rate).toBe(5.5);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
        ),
      );
      expect(mockRedisService.set).toHaveBeenCalledWith('exchange_rate:usd:brl:latest', 5.5, 3600);
    });

    it('should fetch historical rate if date is provided', async () => {
      const date = new Date('2024-01-15');
      const dateStr = '2024-01-15';

      mockRedisService.get.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({
        data: {
          date: dateStr,
          usd: {
            brl: 4.8,
          },
        },
      });

      const rate = await service.getExchangeRate('USD', 'BRL', date);
      expect(rate).toBe(4.8);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/usd.json`,
      );
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `exchange_rate:usd:brl:${dateStr}`,
        4.8,
        3600,
      );
    });
    it('should return 1 on API failure', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const rate = await service.getExchangeRate('USD', 'BRL');
      expect(rate).toBe(1);
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
