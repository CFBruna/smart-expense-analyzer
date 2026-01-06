import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Groceries',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    description: 'Hex color code',
    example: '#3B82F6',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #3B82F6)',
  })
  color!: string;

  @ApiProperty({
    description: 'Lucide icon name',
    example: 'shopping-cart',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  icon!: string;
}
