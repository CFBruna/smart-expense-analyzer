import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import { BcryptService } from '../../../infrastructure/auth/bcrypt.service';
import { JwtAuthService } from '../../../infrastructure/auth/jwt-auth.service';

export interface AuthenticateCommand {
  email: string;
  password: string;
}

export interface AuthenticationResult {
  accessToken: string;
  userId: string;
  email: string;
}

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly bcryptService: BcryptService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async execute(command: AuthenticateCommand): Promise<AuthenticationResult> {
    // Find user by email
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.bcryptService.compare(command.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const accessToken = this.jwtAuthService.generateToken(user.id!, user.email);

    return {
      accessToken,
      userId: user.id!,
      email: user.email,
    };
  }
}
