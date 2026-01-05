import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthService } from './jwt-auth.service';

describe('JwtAuthService', () => {
  let service: JwtAuthService;
  let mockJwtService: any;

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthService, { provide: JwtService, useValue: mockJwtService }],
    }).compile();

    service = module.get<JwtAuthService>(JwtAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', () => {
      const userId = 'user123';
      const email = 'test@example.com';
      const expectedToken = 'jwt.token.here';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = service.generateToken(userId, email);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: userId,
        email,
      });
      expect(result).toBe(expectedToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify and return payload for valid token', () => {
      const token = 'valid.jwt.token';
      const expectedPayload = { sub: 'user123', email: 'test@example.com' };

      mockJwtService.verify.mockReturnValue(expectedPayload);

      const result = service.verifyToken(token);

      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedPayload);
    });
  });

  describe('decode', () => {
    it('should decode token without verification', () => {
      const token = 'jwt.token.here';
      const expectedPayload = { sub: 'user123', email: 'test@example.com' };

      mockJwtService.decode.mockReturnValue(expectedPayload);

      const result = service.decode(token);

      expect(mockJwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedPayload);
    });

    it('should return null for invalid token', () => {
      const token = 'invalid.token';

      mockJwtService.decode.mockReturnValue(null);

      const result = service.decode(token);

      expect(result).toBeNull();
    });
  });
});
