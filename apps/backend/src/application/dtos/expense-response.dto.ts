import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'Transportation' })
  primary!: string;

  @ApiProperty({ example: 'Ride-sharing', nullable: true })
  secondary!: string | null;

  @ApiProperty({ example: ['uber', 'health-related'] })
  tags!: string[];

  @ApiProperty({ example: 0.85 })
  confidence!: number;

  @ApiProperty({ example: 'Uber ride to dentist suggests health-related transportation' })
  rationale?: string;
}

export class ExpenseResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'Uber para dentista' })
  description!: string;

  @ApiProperty({ example: 25.5 })
  amount!: number;

  @ApiProperty({ example: '2026-01-04T00:00:00.000Z' })
  date!: string;

  @ApiProperty({ type: CategoryResponseDto, nullable: true })
  category!: CategoryResponseDto | null;

  @ApiProperty({ example: '2026-01-04T10:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-04T10:30:00.000Z' })
  updatedAt!: string;
}
