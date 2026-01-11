import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsISO8601, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseResponseDto } from './expense-response.dto';

export class ListExpensesDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}

export class PaginationMetaDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class ExpenseListResponseDto {
  @ApiProperty({ type: [ExpenseResponseDto] })
  data!: ExpenseResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
