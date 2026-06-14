import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateSpaceDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
