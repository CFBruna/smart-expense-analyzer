import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockJwtAuthService: any;

  beforeEach(() => {
    mockJwtAuthService = {
      verifyToken: jest.fn(),
    };

    guard = new JwtAuthGuard(mockJwtAuthService);
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authHeader,
      },
      user: undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access with valid token', () => {
      const mockPayload = { sub: 'user123', email: 'test@example.com' };
      mockJwtAuthService.verifyToken.mockReturnValue(mockPayload);

      const context = createMockContext('Bearer valid.token.here');
      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockJwtAuthService.verifyToken).toHaveBeenCalledWith('valid.token.here');

      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
      });
    });

    it('should throw UnauthorizedException when no authorization header', () => {
      const context = createMockContext();

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Missing or invalid authorization header');
    });

    it('should throw UnauthorizedException when authorization header is invalid', () => {
      const context = createMockContext('InvalidHeader');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Missing or invalid authorization header');
    });

    it('should throw UnauthorizedException when token verification fails', () => {
      mockJwtAuthService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const context = createMockContext('Bearer invalid.token');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Invalid or expired token');
    });
  });
});
