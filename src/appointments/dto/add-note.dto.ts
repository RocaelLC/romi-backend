import { IsString, MinLength } from 'class-validator';

export class AddNoteDto {
  @IsString()
  @MinLength(3)
  note!: string;
}
