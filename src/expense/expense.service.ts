import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExpenseDto, GetExpensesDto } from './dto/index';
import { Expense, SpaceRole } from '@prisma/client';
import { PaginatedResult } from 'src/common/types/pagination.types';
import { ExpenseWithDetails } from './types/expense.types';
import { getDateRangeFromPeriod } from './utils/expense-period.util';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    spaceId: string,
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Expense> {
    const spaceUser = await this.prisma.spaceUser.findUnique({
      where: { userId_spaceId: { userId, spaceId } },
    });

    if (!spaceUser) {
      throw new NotFoundException('Space not found');
    }

    if (spaceUser.role !== SpaceRole.ADMIN) {
      throw new ForbiddenException('Only admins can create expenses');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: createExpenseDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.expense.create({
      data: {
        task: createExpenseDto.task,
        amount: createExpenseDto.amount,
        date: new Date(createExpenseDto.date),
        categoryId: createExpenseDto.categoryId,
        userId,
        spaceId,
      },
    });
  }

  async findAll(
    spaceId: string,
    userId: string,
    dto: GetExpensesDto,
  ): Promise<PaginatedResult<ExpenseWithDetails>> {
    const { page, limit, period, date } = dto;
    const skip = (page - 1) * limit;

    const spaceUser = await this.prisma.spaceUser.findUnique({
      where: { userId_spaceId: { userId, spaceId } },
    });

    if (!spaceUser) {
      throw new NotFoundException('Space not found');
    }

    const dateFilter =
      period && date ? { date: getDateRangeFromPeriod(period, date) } : {};

    const [expenses, total] = await this.prisma.$transaction([
      this.prisma.expense.findMany({
        where: { spaceId, ...dateFilter },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          task: true,
          amount: true,
          date: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.expense.count({
        where: { spaceId, ...dateFilter },
      }),
    ]);

    const data: ExpenseWithDetails[] = expenses.map(({ user, ...rest }) => ({
      ...rest,
      addedBy: user,
    }));

    return { data, total, limit, page };
  }
}
