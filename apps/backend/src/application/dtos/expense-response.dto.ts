import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'Food' })
  primary!: string;

  @ApiProperty({ example: 'Restaurant', nullable: true })
  secondary!: string | null;

  @ApiProperty({ example: ['lunch', 'greenpark'], type: [String] })
  tags!: string[];

  @ApiProperty({ example: 0.95 })
  confidence!: number;

  @ApiProperty({ example: 'Lunch at restaurant based on description' })
  rationale!: string;
}

export class ExpenseResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'Almoço greenpark' })
  description!: string;

  @ApiProperty({ example: 75000 })
  amount!: number;

  @ApiProperty({ example: 75000 })
  originalAmount!: number;

  @ApiProperty({ example: 'BRL' })
  originalCurrency!: string;

  @ApiProperty({ example: '2026-01-05T00:00:00.000Z' })
  date!: string;

  @ApiProperty({ type: CategoryResponseDto, nullable: true, required: false })
  category!: CategoryResponseDto | null;

  @ApiProperty({ example: '2026-01-05T15:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-05T15:00:00.000Z' })
  updatedAt!: string;
}
