import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateExpenseDto } from '../../application/dtos/create-expense.dto';
import { ExpenseResponseDto } from '../../application/dtos/expense-response.dto';
import { CreateExpenseUseCase } from '../../application/use-cases/expenses/create-expense.use-case';
import { ListExpensesUseCase } from '../../application/use-cases/expenses/list-expenses.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Expense } from '../../domain/entities/expense.entity';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly listExpensesUseCase: ListExpensesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense with AI categorization' })
  @ApiResponse({ status: 201, description: 'Expense created', type: ExpenseResponseDto })
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
  @ApiOperation({ summary: 'List user expenses with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of expenses' })
  async list(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.listExpensesUseCase.execute({
      userId: req.user.id,
      pagination: { page, limit },
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
            rationale: expense.category.rationale,
          }
        : null,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    };
  }
}
