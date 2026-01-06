import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUserUseCase } from './register-user.use-case';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/category.repository.interface';
import { BcryptService } from '../../../infrastructure/auth/bcrypt.service';
import { User } from '../../../domain/entities/user.entity';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepository: any;
  let mockCategoryRepository: any;
  let mockBcryptService: any;

  beforeEach(async () => {
    mockUserRepository = {
      exists: jest.fn(),
      create: jest.fn(),
    };

    mockCategoryRepository = {
      create: jest.fn(),
    };

    mockBcryptService = {
      hash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: CATEGORY_REPOSITORY, useValue: mockCategoryRepository },
        { provide: BcryptService, useValue: mockBcryptService },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const command = {
      email: 'test@example.com',
      password: 'Test123!@#',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser = new User('123', command.email, hashedPassword, command.name);

      mockUserRepository.exists.mockResolvedValue(false);
      mockBcryptService.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(createdUser);
      mockCategoryRepository.create.mockResolvedValue({});

      const result = await useCase.execute(command);

      expect(mockUserRepository.exists).toHaveBeenCalledWith(command.email);
      expect(mockBcryptService.hash).toHaveBeenCalledWith(command.password);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toBe(createdUser);
      expect(result.email).toBe(command.email);
      expect(result.name).toBe(command.name);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.exists.mockResolvedValue(true);

      await expect(useCase.execute(command)).rejects.toThrow(ConflictException);
      await expect(useCase.execute(command)).rejects.toThrow('User with this email already exists');

      expect(mockUserRepository.exists).toHaveBeenCalledWith(command.email);
      expect(mockBcryptService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should hash the password before storing', async () => {
      const hashedPassword = 'hashedPassword123';
      mockUserRepository.exists.mockResolvedValue(false);
      mockBcryptService.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockImplementation((user: User) => Promise.resolve(user));
      mockCategoryRepository.create.mockResolvedValue({});

      await useCase.execute(command);

      const createCall = mockUserRepository.create.mock.calls[0][0];
      expect(createCall.passwordHash).toBe(hashedPassword);
      expect(createCall.passwordHash).not.toBe(command.password);
    });
  });
});
