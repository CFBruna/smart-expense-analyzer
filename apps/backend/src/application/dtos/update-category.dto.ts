import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Groceries',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    description: 'Hex color code',
    example: '#3B82F6',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code',
  })
  color?: string;

  @ApiProperty({
    description: 'Lucide icon name',
    example: 'shopping-cart',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  icon?: string;
}
