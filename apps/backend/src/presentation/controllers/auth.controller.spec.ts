import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case';
import { AuthenticateUserUseCase } from '../../application/use-cases/auth/authenticate-user.use-case';
import { User } from '../../domain/entities/user.entity';
import { LoggerService } from '../../infrastructure/logger/logger.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockRegisterUseCase: any;
  let mockAuthenticateUseCase: any;
  let mockLogger: any;

  beforeEach(async () => {
    mockRegisterUseCase = {
      execute: jest.fn(),
    };

    mockAuthenticateUseCase = {
      execute: jest.fn(),
    };

    mockLogger = {
      logWithCorrelationId: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUserUseCase, useValue: mockRegisterUseCase },
        { provide: AuthenticateUserUseCase, useValue: mockAuthenticateUseCase },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const dto = {
      email: 'test@example.com',
      password: 'Test123!@#',
      name: 'Test User',
    };

    it('should register a new user', async () => {
      const user = new User('123', dto.email, 'hashedPassword', dto.name);
      mockRegisterUseCase.execute.mockResolvedValue(user);

      const req = { correlationId: 'test-correlation-id' };
      const result = await controller.register(dto, req);

      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
        email: dto.email,
        password: dto.password,
        name: dto.name,
      });

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    const dto = {
      email: 'test@example.com',
      password: 'Test123!@#',
    };

    it('should authenticate user', async () => {
      const authResult = {
        accessToken: 'jwt.token.here',
        userId: '123',
        email: dto.email,
      };

      mockAuthenticateUseCase.execute.mockResolvedValue(authResult);

      const req = { correlationId: 'test-correlation-id' };
      const result = await controller.login(dto, req);

      expect(mockAuthenticateUseCase.execute).toHaveBeenCalledWith({
        email: dto.email,
        password: dto.password,
      });

      expect(result).toEqual(authResult);
    });
  });
});
