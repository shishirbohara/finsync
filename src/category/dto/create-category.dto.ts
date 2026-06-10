import { IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name!: string;
}
