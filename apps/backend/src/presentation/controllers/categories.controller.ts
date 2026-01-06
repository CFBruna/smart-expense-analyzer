import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { CreateCategoryDto } from '../../application/dtos/create-category.dto';
import { UpdateCategoryDto } from '../../application/dtos/update-category.dto';
import { CategoryResponseDto } from '../../application/dtos/category-response.dto';
import { CreateCategoryUseCase } from '../../application/use-cases/categories/create-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/categories/list-categories.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/categories/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/categories/delete-category.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Category } from '../../domain/entities/category.entity';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly listCategoriesUseCase: ListCategoriesUseCase,
        private readonly updateCategoryUseCase: UpdateCategoryUseCase,
        private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new category' })
    @ApiResponse({ status: 201, description: 'Category created', type: CategoryResponseDto })
    @ApiResponse({ status: 400, description: 'Category name already exists' })
    async create(
        @Request() req: any,
        @Body() dto: CreateCategoryDto,
    ): Promise<CategoryResponseDto> {
        const category = await this.createCategoryUseCase.execute({
            userId: req.user.id,
            name: dto.name,
            color: dto.color,
            icon: dto.icon,
        });
        return this.toResponseDto(category);
    }

    @Get()
    @ApiOperation({ summary: 'List user categories' })
    @ApiResponse({ status: 200, description: 'Categories list', type: [CategoryResponseDto] })
    async list(@Request() req: any): Promise<CategoryResponseDto[]> {
        const categories = await this.listCategoriesUseCase.execute({
            userId: req.user.id,
        });
        return categories.map((cat) => this.toResponseDto(cat));
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a category' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    @ApiResponse({ status: 200, description: 'Category updated', type: CategoryResponseDto })
    @ApiResponse({ status: 403, description: 'Cannot modify default categories' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDto,
    ): Promise<CategoryResponseDto> {
        const category = await this.updateCategoryUseCase.execute({
            id,
            userId: req.user.id,
            name: dto.name,
            color: dto.color,
            icon: dto.icon,
        });
        return this.toResponseDto(category);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a category' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    @ApiResponse({ status: 204, description: 'Category deleted' })
    @ApiResponse({ status: 403, description: 'Cannot delete default categories' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async delete(@Request() req: any, @Param('id') id: string): Promise<void> {
        await this.deleteCategoryUseCase.execute({
            id,
            userId: req.user.id,
        });
    }

    private toResponseDto(category: Category): CategoryResponseDto {
        return {
            id: category.id!,
            name: category.name,
            color: category.color,
            icon: category.icon,
            isDefault: category.isDefault,
            createdAt: category.createdAt.toISOString(),
            updatedAt: category.updatedAt.toISOString(),
        };
    }
}
