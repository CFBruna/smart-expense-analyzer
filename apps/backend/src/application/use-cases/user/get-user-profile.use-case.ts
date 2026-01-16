import { Injectable, Inject } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class GetUserProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }
}
