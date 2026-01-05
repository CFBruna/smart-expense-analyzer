import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthenticateUserUseCase } from './authenticate-user.use-case';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { BcryptService } from '../../../infrastructure/auth/bcrypt.service';
import { JwtAuthService } from '../../../infrastructure/auth/jwt-auth.service';
import { User } from '../../../domain/entities/user.entity';

describe('AuthenticateUserUseCase', () => {
  let useCase: AuthenticateUserUseCase;
  let mockUserRepository: any;
  let mockBcryptService: any;
  let mockJwtAuthService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
    };

    mockBcryptService = {
      compare: jest.fn(),
    };

    mockJwtAuthService = {
      generateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticateUserUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: BcryptService, useValue: mockBcryptService },
        { provide: JwtAuthService, useValue: mockJwtAuthService },
      ],
    }).compile();

    useCase = module.get<AuthenticateUserUseCase>(AuthenticateUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const command = {
      email: 'test@example.com',
      password: 'Test123!@#',
    };

    const user = new User('123', command.email, 'hashedPassword', 'Test User');

    it('should authenticate user successfully', async () => {
      const token = 'jwt.token.here';

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockBcryptService.compare.mockResolvedValue(true);
      mockJwtAuthService.generateToken.mockReturnValue(token);

      const result = await useCase.execute(command);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(command.email);
      expect(mockBcryptService.compare).toHaveBeenCalledWith(command.password, user.passwordHash);
      expect(mockJwtAuthService.generateToken).toHaveBeenCalledWith(user.id, user.email);

      expect(result).toEqual({
        accessToken: token,
        userId: user.id,
        email: user.email,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException);
      await expect(useCase.execute(command)).rejects.toThrow('Invalid credentials');

      expect(mockBcryptService.compare).not.toHaveBeenCalled();
      expect(mockJwtAuthService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockBcryptService.compare.mockResolvedValue(false);

      await expect(useCase.execute(command)).rejects.toThrow(UnauthorizedException);
      await expect(useCase.execute(command)).rejects.toThrow('Invalid credentials');

      expect(mockBcryptService.compare).toHaveBeenCalledWith(command.password, user.passwordHash);
      expect(mockJwtAuthService.generateToken).not.toHaveBeenCalled();
    });
  });
});
