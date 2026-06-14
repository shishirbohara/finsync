import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, GetExpensesDto } from './dto/index';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { UserProfile } from 'src/auth/types/auth.types';
import { ApiResponse, successResponse } from 'src/common/response.util';
import { Expense } from '@prisma/client';
import { PaginatedResult } from 'src/common/types/pagination.types';
import { ExpenseWithDetails } from './types/expense.types';

@Controller('space/:spaceId/expenses')
@UseGuards(JwtGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(
    @Param('spaceId') spaceId: string,
    @CurrentUser() user: UserProfile,
    @Body() createExpenseDto: CreateExpenseDto,
  ): Promise<ApiResponse<Expense>> {
    const data = await this.expenseService.create(
      spaceId,
      user.id,
      createExpenseDto,
    );
    return successResponse('Expense created successfully', data);
  }

  @Get()
  async findAll(
    @Param('spaceId') spaceId: string,
    @CurrentUser() user: UserProfile,
    @Query() dto: GetExpensesDto,
  ): Promise<ApiResponse<PaginatedResult<ExpenseWithDetails>>> {
    const data = await this.expenseService.findAll(spaceId, user.id, dto);
    return successResponse('Expenses fetched successfully', data);
  }
}
