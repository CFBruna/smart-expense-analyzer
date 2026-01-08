import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateExpenseDto } from '../../application/dtos/create-expense.dto';
import { UpdateExpenseDto } from '../../application/dtos/update-expense.dto';
import { ExpenseResponseDto } from '../../application/dtos/expense-response.dto';
import { CreateExpenseUseCase } from '../../application/use-cases/expenses/create-expense.use-case';
import { UpdateExpenseUseCase } from '../../application/use-cases/expenses/update-expense.use-case';
import { ListExpensesUseCase } from '../../application/use-cases/expenses/list-expenses.use-case';
import { GetExpenseByIdUseCase } from '../../application/use-cases/expenses/get-expense-by-id.use-case';
import { DeleteExpenseUseCase } from '../../application/use-cases/expenses/delete-expense.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Expense } from '../../domain/entities/expense.entity';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly updateExpenseUseCase: UpdateExpenseUseCase,
    private readonly listExpensesUseCase: ListExpensesUseCase,
    private readonly getExpenseByIdUseCase: GetExpenseByIdUseCase,
    private readonly deleteExpenseUseCase: DeleteExpenseUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense (AI categorization in background)' })
  @ApiResponse({
    status: 201,
    description: 'Expense created (category pending)',
    type: ExpenseResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req: any, @Body() dto: CreateExpenseDto): Promise<ExpenseResponseDto> {
    const expense = await this.createExpenseUseCase.execute({
      userId: req.user.id,
      description: dto.description,
      amount: dto.amount,
      date: new Date(dto.date),
    });

    return this.toResponseDto(expense);
  }

  @Get()
  @ApiOperation({ summary: 'List user expenses with pagination and date filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'ISO date string' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'ISO date string' })
  @ApiResponse({ status: 200, description: 'List of expenses' })
  async list(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.listExpensesUseCase.execute({
      userId: req.user.id,
      pagination: { page, limit },
      filters: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    return {
      data: result.expenses.map((e: Expense) => this.toResponseDto(e)),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense found', type: ExpenseResponseDto })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async getById(@Request() req: any, @Param('id') id: string): Promise<ExpenseResponseDto> {
    const expense = await this.getExpenseByIdUseCase.execute({
      id,
      userId: req.user.id,
    });
    return this.toResponseDto(expense);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense updated', type: ExpenseResponseDto })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.updateExpenseUseCase.execute({
      id,
      userId: req.user.id,
      description: dto.description,
      amount: dto.amount,
      date: dto.date ? new Date(dto.date) : undefined,
      manualCategory: dto.manualCategory,
    });
    return this.toResponseDto(expense);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 204, description: 'Expense deleted' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async delete(@Request() req: any, @Param('id') id: string): Promise<void> {
    await this.deleteExpenseUseCase.execute({
      id,
      userId: req.user.id,
    });
  }

  private toResponseDto(expense: Expense): ExpenseResponseDto {
    return {
      id: expense.id!,
      description: expense.description,
      amount: expense.amount,
      date: expense.date.toISOString(),
      category: expense.category
        ? {
            primary: expense.category.primary,
            secondary: expense.category.secondary,
            tags: expense.category.tags,
            confidence: expense.category.confidence,
            rationale: expense.category.rationale || '',
          }
        : null,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
  }
}
