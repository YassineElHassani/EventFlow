import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getModelToken } from '@nestjs/mongoose';
import { Event, EventStatus } from './schemas/event.schema';
import { NotFoundException } from '@nestjs/common';

// Mock Data For Testing
const mockEvent = {
    _id: 'someId',
    title: 'Test Event',
    description: 'Desc',
    date: new Date(),
    location: 'Rabat',
    totalCapacity: 100,
    status: EventStatus.DRAFT,
    reservedSeats: 0,
};

// Mock Mongoose Model
class MockEventModel {
    save: jest.Mock;

    constructor(private data: any) {
        this.save = jest.fn().mockResolvedValue(this.data);
    }

    // Static methods mocking
    static find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockEvent]), // Return array
        }),
    });

    static findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent), // Return object
    });

    static findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
    });

    static findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockEvent, title: 'Updated' }),
    });

    static findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
    });
}

describe('EventsService', () => {
    let service: EventsService;
    let model: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsService,
                {
                    // Inject the mock model instead of the real Mongoose model
                    provide: getModelToken(Event.name),
                    useValue: MockEventModel,
                },
            ],
        }).compile();

        service = module.get<EventsService>(EventsService);
        model = module.get(getModelToken(Event.name));
    });

    // SERVICE DEFINITION
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // CREATE
    it('should create an event', async () => {
        const createDto = {
            title: 'Test Event',
            description: 'Desc',
            date: new Date(),
            location: 'Rabat',
            totalCapacity: 100
        };

        const result = await service.create(createDto as any);
        expect(result).toEqual(expect.objectContaining({ title: 'Test Event' }));
    });

    // FIND ALL
    it('should return an array of events', async () => {
        const result = await service.findAll();
        expect(result).toEqual([mockEvent]);
        expect(MockEventModel.find).toHaveBeenCalled();
    });

    // FIND ONE (Success)
    it('should find one event by ID', async () => {
        const result = await service.findOne('someId');
        expect(result).toEqual(mockEvent);
        expect(MockEventModel.findById).toHaveBeenCalledWith('someId');
    });

    // FIND ONE (Error - Not Found)
    it('should throw NotFoundException if event not found', async () => {
        // Override behavior for this specific test
        jest.spyOn(MockEventModel, 'findById').mockReturnValueOnce({
            exec: jest.fn().mockResolvedValue(null), // Simulation "Not found"
        } as any);

        await expect(service.findOne('badId')).rejects.toThrow(NotFoundException);
    });

    // FIND ONE PUBLIC (Success)
    it('should find public event', async () => {
        const mockPublicEvent = { ...mockEvent, status: EventStatus.PUBLISHED };
        jest.spyOn(MockEventModel, 'findOne').mockReturnValueOnce({
            exec: jest.fn().mockResolvedValue(mockPublicEvent),
        } as any);

        const result = await service.findOnePublic('someId');
        expect(result.status).toBe(EventStatus.PUBLISHED);
    });
});