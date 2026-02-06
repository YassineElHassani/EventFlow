import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import type { ApiResponse } from '../common/interfaces/api-response.interface';

interface RequestWithUser {
  user: {
    _id: string;
    email: string;
    role: UserRole;
  };
}

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @Roles(UserRole.PARTICIPANT)
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req: RequestWithUser,
  ): Promise<ApiResponse> {
    const reservation = await this.reservationsService.create(
      createReservationDto,
      req.user._id,
    );
    return {
      success: true,
      message: 'Reservation created successfully',
      data: reservation,
    };
  }

  @Get('my')
  @Roles(UserRole.PARTICIPANT)
  async findMyReservations(
    @Request() req: RequestWithUser,
  ): Promise<ApiResponse> {
    const reservations = await this.reservationsService.findMyReservations(
      req.user._id,
    );
    return {
      success: true,
      message: 'My reservations retrieved successfully',
      data: reservations,
    };
  }

  @Get(':id/ticket')
  @Roles(UserRole.PARTICIPANT)
  async downloadTicket(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reservationsService.getTicketPdf(
      id,
      req.user._id,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.PARTICIPANT)
  async cancel(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<ApiResponse> {
    const reservation = await this.reservationsService.cancelMyReservation(
      id,
      req.user._id,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return {
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation,
    };
  }

  @Get('event/:eventId')
  @Roles(UserRole.ADMIN)
  async findByEvent(@Param('eventId') eventId: string): Promise<ApiResponse> {
    const reservations = await this.reservationsService.findByEvent(eventId);
    return {
      success: true,
      message: 'Event reservations retrieved successfully',
      data: reservations,
    };
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateReservationStatusDto,
  ): Promise<ApiResponse> {
    const reservation = await this.reservationsService.updateStatus(
      id,
      updateDto.status,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return {
      success: true,
      message: 'Reservation status updated successfully',
      data: reservation,
    };
  }
}
