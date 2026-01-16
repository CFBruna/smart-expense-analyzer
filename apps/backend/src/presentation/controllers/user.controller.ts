import { Controller, Patch, Body, Request, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateUserCurrencyUseCase } from '../../application/use-cases/user/update-user-currency.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/user/update-user-profile.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/user/get-user-profile.use-case';
import { IsString, Length } from 'class-validator';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';

class UpdateCurrencyDto {
  @IsString()
  @Length(3, 3)
  currency!: string;
}

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly updateUserCurrencyUseCase: UpdateUserCurrencyUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
  ) { }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req: any) {
    const user = await this.getUserProfileUseCase.execute(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
      language: user.language,
      createdAt: user.createdAt,
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile (name, currency, language)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateUserProfileDto) {
    const updatedUser = await this.updateUserProfileUseCase.execute({
      userId: req.user.id,
      name: dto.name,
      currency: dto.currency,
      language: dto.language,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      currency: updatedUser.currency,
      language: updatedUser.language,
      message: 'Profile updated successfully',
    };
  }

  @Patch('profile/currency')
  @ApiOperation({ summary: 'Update user currency and recalculate expenses' })
  @ApiResponse({ status: 200, description: 'Currency updated successfully' })
  async updateCurrency(@Request() req: any, @Body() dto: UpdateCurrencyDto) {
    const updatedUser = await this.updateUserCurrencyUseCase.execute({
      userId: req.user.id,
      newCurrency: dto.currency,
    });

    return {
      currency: updatedUser.currency,
      message: 'Currency updated and expenses recalculated successfully',
    };
  }
}
