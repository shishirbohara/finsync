import { ExpensePeriod } from '../dto/index';

export function getDateRangeFromPeriod(
  period: ExpensePeriod,
  date: string,
): { gte: Date; lte: Date } {
  const base = new Date(date);

  switch (period) {
    case ExpensePeriod.DAILY: {
      const start = new Date(base);
      start.setHours(0, 0, 0, 0);
      const end = new Date(base);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }

    case ExpensePeriod.WEEKLY: {
      const start = new Date(base);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }

    case ExpensePeriod.MONTHLY: {
      const start = new Date(base.getFullYear(), base.getMonth(), 1);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }

    case ExpensePeriod.YEARLY: {
      const start = new Date(base.getFullYear(), 0, 1);
      const end = new Date(base.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      return { gte: start, lte: end };
    }
  }
}
