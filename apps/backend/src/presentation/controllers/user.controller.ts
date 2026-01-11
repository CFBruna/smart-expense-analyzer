import { Controller, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateUserCurrencyUseCase } from '../../application/use-cases/user/update-user-currency.use-case';
import { IsString, Length } from 'class-validator';

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
  constructor(private readonly updateUserCurrencyUseCase: UpdateUserCurrencyUseCase) {}

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
