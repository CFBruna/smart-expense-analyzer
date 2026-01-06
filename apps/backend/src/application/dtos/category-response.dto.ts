import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'Groceries' })
  name!: string;

  @ApiProperty({ example: '#3B82F6' })
  color!: string;

  @ApiProperty({ example: 'shopping-cart' })
  icon!: string;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiProperty({ example: '2026-01-05T19:00:00Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-05T19:00:00Z' })
  updatedAt!: string;
}
