import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsDateString()
    date: Date;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    totalCapacity: number;

    @IsOptional()
    @IsEnum(EventStatus)
    status?: EventStatus;
}