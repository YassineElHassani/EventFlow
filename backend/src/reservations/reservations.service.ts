import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument, ReservationStatus } from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { EventsService } from '../events/events.service';
import { PdfService } from './pdf.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private eventsService: EventsService,
    private pdfService: PdfService,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: string) {
    const { eventId } = createReservationDto;

    const event = await this.eventsService.findOnePublic(eventId);

    if (event.reservedSeats >= event.totalCapacity) {
      throw new ConflictException('Event is fully booked (Sold Out).');
    }

    const existing = await this.reservationModel.findOne({ userId, eventId });
    if (existing) {
      throw new ConflictException('You have already booked this event.');
    }

    const reservation = new this.reservationModel({
      userId,
      eventId,
      status: ReservationStatus.PENDING,
    });

    await reservation.save();

    // Increment reservedSeats
    await this.eventsService.update(eventId, { 
      reservedSeats: event.reservedSeats + 1 
    } as any);

    return reservation;
  }

  // For Participant
  async findMyReservations(userId: string) {
    return this.reservationModel.find({ userId }).populate('eventId').sort({ createdAt: -1 });
  }

  // For Admin
  async findByEvent(eventId: string) {
    return this.reservationModel.find({ eventId }).populate('userId');
  }

  // For Admin
  async updateStatus(id: string, status: ReservationStatus) {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) throw new NotFoundException('Reservation not found');

    const previousStatus = reservation.status;
    reservation.status = status;
    await reservation.save();

    // Manage seat counts based on status change
    if (status === ReservationStatus.REFUSED || status === ReservationStatus.CANCELED) {
      if (previousStatus !== ReservationStatus.REFUSED && previousStatus !== ReservationStatus.CANCELED) {
         // Decrement seat
         const event = await this.eventsService.findOne(reservation.eventId);
         await this.eventsService.update(reservation.eventId, { 
            reservedSeats: Math.max(0, event.reservedSeats - 1) 
         } as any);
      }
    }
    
    return reservation;
  }

  // For Participant
  async cancelMyReservation(id: string, userId: string) {
    const reservation = await this.reservationModel.findOne({ _id: id, userId });
    if (!reservation) throw new NotFoundException('Reservation not found');

    if (reservation.status === ReservationStatus.CANCELED) {
        throw new BadRequestException('Already canceled');
    }

    reservation.status = ReservationStatus.CANCELED;
    await reservation.save();

    // Decrement seat
    const event = await this.eventsService.findOne(reservation.eventId);
    await this.eventsService.update(reservation.eventId, { 
       reservedSeats: Math.max(0, event.reservedSeats - 1) 
    } as any);

    return reservation;
  }

  // For Participant
  async getTicketPdf(id: string, userId: string) {
    const reservation = await this.reservationModel
      .findOne({ _id: id, userId })
      .populate('eventId')
      .populate('userId');

    if (!reservation) throw new NotFoundException('Reservation not found');
    
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Ticket available only for CONFIRMED reservations');
    }

    return this.pdfService.generateTicket(reservation);
  }
}