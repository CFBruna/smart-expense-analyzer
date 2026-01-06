import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../domain/repositories/category.repository.interface';
import { BcryptService } from '../../../infrastructure/auth/bcrypt.service';
import { Category } from '../../../domain/entities/category.entity';

export interface RegisterUserCommand {
  email: string;
  password: string;
  name: string;
}

const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', color: '#10b981', icon: 'utensils', isDefault: true },
  { name: 'Transporte', color: '#3b82f6', icon: 'car', isDefault: true },
  { name: 'Saúde', color: '#ef4444', icon: 'heart-pulse', isDefault: true },
  { name: 'Moradia', color: '#f59e0b', icon: 'home', isDefault: true },
  { name: 'Entretenimento', color: '#8b5cf6', icon: 'tv', isDefault: true },
  { name: 'Educação', color: '#06b6d4', icon: 'graduation-cap', isDefault: true },
  { name: 'Compras', color: '#ec4899', icon: 'shopping-cart', isDefault: true },
  { name: 'Contas', color: '#6366f1', icon: 'file-text', isDefault: true },
  { name: 'Outros', color: '#64748b', icon: 'folder-kanban', isDefault: true },
];

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const exists = await this.userRepository.exists(command.email);
    if (exists) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.bcryptService.hash(command.password);

    const user = new User(null, command.email, passwordHash, command.name);

    const createdUser = await this.userRepository.create(user);

    await this.seedDefaultCategories(createdUser.id!);

    return createdUser;
  }

  private async seedDefaultCategories(userId: string): Promise<void> {
    const categoryPromises = DEFAULT_CATEGORIES.map((catData) => {
      const category = new Category(
        null,
        userId,
        catData.name,
        catData.color,
        catData.icon,
        catData.isDefault,
        new Date(),
        new Date(),
      );
      return this.categoryRepository.create(category);
    });

    await Promise.all(categoryPromises);
  }
}
