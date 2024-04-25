import { Injectable } from '@nestjs/common';
import { UserDto } from '@app/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { EventsRepository } from './events.repository';

@Injectable()
export class EventsService {
  findOne(eventId: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private readonly eventsRepository: EventsRepository,
    @InjectConnection() private connection: Connection,
  ) { }

  async createEvent(eventData: any, user: UserDto) {
    console.log("Creating event");
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdEvent = await this.eventsRepository.create(eventData, { session });
      await session.commitTransaction();
      return createdEvent;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }


  async findAll() {
    console.log("Fetching all events");
    return this.eventsRepository.findAll({});
  }

  async findOneById(eventId: string) {
    console.log("Fetching event by ID");
    return this.eventsRepository.findOne({ _id: eventId });
  }

  async updateOne(eventId: string, eventData: any) {
    console.log("Updating event");
    return this.eventsRepository.findOneAndUpdate(
      { _id: eventId },
      { $set: eventData },
    );
  }
}
