import { ApiProperty } from '@nestjs/swagger';
import { Expense as IExpense, Category as ICategory } from '@smart-expense-analyzer/shared';

export class CategoryResponseDto implements ICategory {
  @ApiProperty({ example: 'Food' })
  primary!: string;

  @ApiProperty({ example: 'Restaurant', nullable: true })
  secondary!: string | null;

  @ApiProperty({ example: ['lunch', 'greenpark'], type: [String] })
  tags!: string[];

  @ApiProperty({ example: 0.95 })
  confidence!: number;

  @ApiProperty({ example: 'Lunch at restaurant based on description', required: false })
  rationale?: string;
}

export class ExpenseResponseDto implements IExpense {
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
