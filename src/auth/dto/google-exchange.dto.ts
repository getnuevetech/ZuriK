import { IsString, Length } from 'class-validator';

export class GoogleExchangeDto {
  @IsString()
  @Length(32, 256)
  code: string;
}
