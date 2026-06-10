import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { PaginatedResult } from 'src/common/types/pagination.types';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.prisma.category.findFirst({
      where: { name: { equals: createCategoryDto.name, mode: 'insensitive' } },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name alreay exists');
    }

    const newCategory = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
      },
    });

    return newCategory;
  }

  async findAll(dto: GetCategoriesDto): Promise<PaginatedResult<Category>> {
    const { limit, page } = dto;
    const skip = (page - 1) * limit;

    const [categories, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.count(),
    ]);

    return { data: categories, total, limit, page };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    const updateCategory = await this.prisma.category.update({
      where: {
        id,
      },
      data: {
        name: updateCategoryDto.name,
      },
    });

    return updateCategory;
  }

  async remove(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    const deleteCategory = await this.prisma.category.delete({
      where: {
        id,
      },
    });

    return deleteCategory;
  }
}
