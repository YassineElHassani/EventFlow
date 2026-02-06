import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getModelToken } from '@nestjs/mongoose';
import { Reservation, ReservationStatus } from './schemas/reservation.schema';
import { EventsService } from '../events/events.service';
import { PdfService } from './pdf.service';
import { ConflictException } from '@nestjs/common';

class MockModel {
  save: jest.Mock;
  status: string;
  constructor(public data: Partial<Reservation>) {
    this.status = data.status || ReservationStatus.PENDING;
    this.save = jest
      .fn()
      .mockResolvedValue({ ...this.data, status: this.status });
  }
  static findOne = jest.fn();
  static find = jest.fn();
  static findById = jest.fn();
}

// Mock Events Service
const mockEventsService = {
  findOnePublic: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  incrementSeats: jest.fn(),
};

// Mock Pdf Service
const mockPdfService = {
  generateTicket: jest.fn(),
};

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: MockModel, // Using the MockModel class for Mongoose model
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Create Reservation Tests
  it('should create a reservation successfully', async () => {
    const eventMock = {
      _id: 'evt1',
      totalCapacity: 100,
      reservedSeats: 10,
    };

    mockEventsService.findOnePublic.mockResolvedValue(eventMock);
    MockModel.findOne.mockResolvedValue(null);

    const result = await service.create({ eventId: 'evt1' }, 'user1');

    expect(result).toBeDefined();
    expect(result.status).toBe(ReservationStatus.PENDING);
    expect(mockEventsService.incrementSeats).toHaveBeenCalledWith('evt1', 1);
  });

  // Event Full (Sold Out) Failure
  it('should throw ConflictException if event is full', async () => {
    const fullEventMock = {
      _id: 'evtFull',
      totalCapacity: 50,
      reservedSeats: 50, // Full
    };

    mockEventsService.findOnePublic.mockResolvedValue(fullEventMock);

    await expect(
      async () => await service.create({ eventId: 'evtFull' }, 'user1'),
    ).rejects.toThrow(ConflictException);
  });

  // Duplicate Reservation Failure
  it('should throw ConflictException if user already booked', async () => {
    const eventMock = {
      _id: 'evt1',
      totalCapacity: 100,
      reservedSeats: 10,
    };

    mockEventsService.findOnePublic.mockResolvedValue(eventMock);
    MockModel.findOne.mockResolvedValue({ _id: 'existingRes' });

    await expect(
      async () => await service.create({ eventId: 'evt1' }, 'user1'),
    ).rejects.toThrow(ConflictException);
  });

  // Admin Validation (Update Status)
  it('should update status and handle refusal logic', async () => {
    const existingRes = {
      _id: 'res1',
      eventId: 'evt1',
      status: ReservationStatus.PENDING,
      save: jest.fn(),
    };

    MockModel.findById.mockResolvedValue(existingRes);

    await service.updateStatus('res1', ReservationStatus.REFUSED);

    expect(existingRes.status).toBe(ReservationStatus.REFUSED);
    expect(existingRes.save).toHaveBeenCalled();
    expect(mockEventsService.incrementSeats).toHaveBeenCalledWith('evt1', -1);
  });
});
