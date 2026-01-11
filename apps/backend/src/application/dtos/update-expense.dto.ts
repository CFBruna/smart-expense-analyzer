import { IsString, IsNumber, IsOptional, IsDateString, ValidateNested, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ManualCategoryDto {
  @ApiPropertyOptional({ example: 'Food' })
  @IsString()
  primary!: string;

  @ApiPropertyOptional({ example: 'Groceries', nullable: true })
  @IsOptional()
  @IsString()
  secondary?: string | null;
}

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 'Almoço no restaurante' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 45.5 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 45.5 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  originalAmount?: number;

  @ApiPropertyOptional({ example: 'BRL' })
  @IsOptional()
  @IsString()
  originalCurrency?: string;

  @ApiPropertyOptional({ type: ManualCategoryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ManualCategoryDto)
  manualCategory?: ManualCategoryDto;
}
