import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { EventStatus } from './schemas/event.schema';
import type { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createEventDto: CreateEventDto): Promise<ApiResponse> {
    const event = await this.eventsService.create(createEventDto);
    return {
      success: true,
      message: 'Event created successfully',
      data: event,
    };
  }

  @Get()
  async findAllPublic(): Promise<ApiResponse> {
    const events = await this.eventsService.findAll({
      status: EventStatus.PUBLISHED,
    });
    return {
      success: true,
      message: 'Published events retrieved successfully',
      data: events,
    };
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllAdmin(): Promise<ApiResponse> {
    const events = await this.eventsService.findAll();
    return {
      success: true,
      message: 'All events retrieved successfully',
      data: events,
    };
  }

  @Get(':id')
  async findOnePublic(@Param('id') id: string): Promise<ApiResponse> {
    const event = await this.eventsService.findOnePublic(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return {
      success: true,
      message: 'Event retrieved successfully',
      data: event,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<ApiResponse> {
    const event = await this.eventsService.update(id, updateEventDto);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return {
      success: true,
      message: 'Event updated successfully',
      data: event,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    const event = await this.eventsService.remove(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return {
      success: true,
      message: 'Event deleted successfully',
      data: event,
    };
  }
}
