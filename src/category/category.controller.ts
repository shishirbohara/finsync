import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiResponse, successResponse } from 'src/common/response.util';
import { Category } from '@prisma/client';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { PaginatedResult } from 'src/common/types/pagination.types';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    const data = await this.categoryService.create(createCategoryDto);
    return successResponse('Category created successfully', data);
  }

  @Get()
  async findAll(
    @Query() dto: GetCategoriesDto,
  ): Promise<ApiResponse<PaginatedResult<Category>>> {
    const data = await this.categoryService.findAll(dto);
    return successResponse('Categories fetched successfully', data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Category>> {
    const data = await this.categoryService.findOne(id);
    return successResponse(`Category with id ${id} fetched successfully`, data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    const data = await this.categoryService.update(id, updateCategoryDto);
    return successResponse('Category updated successfully', data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<Category>> {
    const deletedCategory = await this.categoryService.remove(id);
    return successResponse('Category deleted successfully', deletedCategory);
  }
}
