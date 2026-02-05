import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument, EventStatus } from './schemas/event.schema';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const createdEvent = new this.eventModel(createEventDto);
    return createdEvent.save();
  }

  async findAll(filter: any = {}): Promise<Event[]> {
    return this.eventModel.find(filter).sort({ date: 1 }).exec();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) throw new NotFoundException(`Event #${id} not found`);
    return event;
  }

  async findOnePublic(id: string): Promise<Event> {
    const event = await this.eventModel.findOne({ 
      _id: id, 
      status: EventStatus.PUBLISHED
    }).exec();

    if (!event) {
      throw new NotFoundException(`Event not found or not available`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
    if (!updatedEvent) throw new NotFoundException(`Event #${id} not found`);
    return updatedEvent;
  }

  async remove(id: string): Promise<Event> {
    const deletedEvent = await this.eventModel.findByIdAndDelete(id).exec();
    if (!deletedEvent) throw new NotFoundException(`Event #${id} not found`);
    return deletedEvent;
  }
}