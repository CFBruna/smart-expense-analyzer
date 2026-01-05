import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { GetAnalyticsUseCase } from '../../application/use-cases/expenses/get-analytics.use-case';
import { JwtAuthService } from '../../infrastructure/auth/jwt-auth.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let mockGetAnalyticsUseCase: any;

  beforeEach(async () => {
    mockGetAnalyticsUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: GetAnalyticsUseCase, useValue: mockGetAnalyticsUseCase },
        { provide: JwtAuthService, useValue: { verifyToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    const mockRequest = {
      user: { id: 'user123', email: 'test@example.com' },
    };

    it('should return analytics summary without period', async () => {
      const mockResult = {
        totalSpent: 150,
        categoryBreakdown: [
          { category: 'Food', total: 100, count: 5, percentage: 66.67 },
          { category: 'Transportation', total: 50, count: 3, percentage: 33.33 },
        ],
        period: {},
      };

      mockGetAnalyticsUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.getSummary(mockRequest);

      expect(mockGetAnalyticsUseCase.execute).toHaveBeenCalledWith({
        userId: mockRequest.user.id,
        startDate: undefined,
        endDate: undefined,
      });

      expect(result).toEqual(mockResult);
    });

    it('should return analytics for week period', async () => {
      const mockResult = {
        totalSpent: 100,
        categoryBreakdown: [],
        period: { startDate: expect.any(Date), endDate: expect.any(Date) },
      };

      mockGetAnalyticsUseCase.execute.mockResolvedValue(mockResult);

      await controller.getSummary(mockRequest, 'week' as any);

      const call = mockGetAnalyticsUseCase.execute.mock.calls[0][0];
      expect(call.userId).toBe(mockRequest.user.id);
      expect(call.startDate).toBeInstanceOf(Date);
      expect(call.endDate).toBeInstanceOf(Date);
    });

    it('should return analytics for month period', async () => {
      mockGetAnalyticsUseCase.execute.mockResolvedValue({
        totalSpent: 0,
        categoryBreakdown: [],
        period: {},
      });

      await controller.getSummary(mockRequest, 'month' as any);

      const call = mockGetAnalyticsUseCase.execute.mock.calls[0][0];
      expect(call.startDate).toBeInstanceOf(Date);
    });

    it('should return analytics for year period', async () => {
      mockGetAnalyticsUseCase.execute.mockResolvedValue({
        totalSpent: 0,
        categoryBreakdown: [],
        period: {},
      });

      await controller.getSummary(mockRequest, 'year' as any);

      const call = mockGetAnalyticsUseCase.execute.mock.calls[0][0];
      expect(call.startDate).toBeInstanceOf(Date);
    });
  });
});
