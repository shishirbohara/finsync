import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';

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

  async findAll() {
    return `This action returns all category`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
