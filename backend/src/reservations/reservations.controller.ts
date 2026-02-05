import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  @Post()
  @Roles(UserRole.PARTICIPANT)
  create(@Body() createReservationDto: CreateReservationDto, @Request() req) {
    return this.reservationsService.create(createReservationDto, req.user._id);
  }

  @Get('my')
  @Roles(UserRole.PARTICIPANT)
  findMyReservations(@Request() req) {
    return this.reservationsService.findMyReservations(req.user._id);
  }

  @Get(':id/ticket')
  @Roles(UserRole.PARTICIPANT)
  async downloadTicket(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const pdfBuffer = await this.reservationsService.getTicketPdf(id, req.user._id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.PARTICIPANT)
  cancel(@Param('id') id: string, @Request() req) {
    return this.reservationsService.cancelMyReservation(id, req.user._id);
  }

  @Get('event/:eventId')
  @Roles(UserRole.ADMIN)
  findByEvent(@Param('eventId') eventId: string) {
    return this.reservationsService.findByEvent(eventId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, updateDto.status);
  }
}