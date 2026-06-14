import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum ExpensePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class GetExpensesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ExpensePeriod)
  period?: ExpensePeriod;

  @IsOptional()
  @IsDateString()
  date?: string;
}
