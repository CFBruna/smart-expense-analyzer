import { Injectable, Inject } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UpdateUserCurrencyUseCase } from './update-user-currency.use-case';

export interface UpdateUserProfileInput {
  userId: string;
  name?: string;
  currency?: string;
  language?: string;
}

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly updateUserCurrencyUseCase: UpdateUserCurrencyUseCase,
  ) {}

  async execute(input: UpdateUserProfileInput): Promise<User> {
    let user: User | null = null;

    if (input.currency) {
      user = await this.updateUserCurrencyUseCase.execute({
        userId: input.userId,
        newCurrency: input.currency,
      });
    }

    const updates: { name?: string; language?: string } = {};
    if (input.name) updates.name = input.name;
    if (input.language) updates.language = input.language;

    if (Object.keys(updates).length > 0) {
      user = await this.userRepository.update(input.userId, updates);
    }

    if (!user) {
      const foundUser = await this.userRepository.findById(input.userId);
      if (!foundUser) throw new Error('User not found');
      return foundUser;
    }

    return user;
  }
}
