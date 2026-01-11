import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Uber para dentista', minLength: 2, maxLength: 500 })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(2, { message: 'Description must be at least 2 characters' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description!: string;

  @ApiProperty({ example: 25.5, minimum: 0.01 })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount!: number;

  @ApiProperty({ example: '2026-01-04T00:00:00Z' })
  @IsDateString({}, { message: 'Date must be a valid ISO 8601 date string' })
  date!: string;

  @ApiProperty({ example: 25.5, minimum: 0.01, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Original amount must be a number' })
  @Min(0.01, { message: 'Original amount must be greater than 0' })
  originalAmount?: number;

  @ApiProperty({ example: 'BRL', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  originalCurrency?: string;
}
