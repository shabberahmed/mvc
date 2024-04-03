import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { PAYMENTS_SERVICE, UserDto } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, flatMap, lastValueFrom, map, mergeMap, of, } from 'rxjs';
import { EventsRepository } from './events.repository';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { EventDto } from '@app/common/dto/event-dto';
import { ReservationDto } from './dto/reservation-dto';

@Injectable()
export class ReservationsService {
  readonly logger: Logger;

  constructor(
    private  reservationsRepository: ReservationsRepository,
    private  eventsRepository: EventsRepository,
    @InjectConnection() private connection: Connection,
    @Inject(PAYMENTS_SERVICE) private readonly paymentService: ClientProxy,

  ) { }

  async create(createReservationDto: any, user: UserDto) {
 console.log("session started")
    const session = await this.connection.startSession()
    console.log("start session")
    return await session.withTransaction(async () => {
      // const payemntResponse = await lastValueFrom(this.paymentService.send('create-charge', { ...createReservationDto.charge, email: user.email }))
      console.log("service check")
      const newReservation = await this.reservationsRepository.create({
        ...createReservationDto,
        invoiceId: "1122",
        userId: user._id,
        timestamp: new Date(),
        ...createReservationDto.event
      })

      //  await this.eventsRepository.updateEventTicket(
      //   { _id: createReservationDto.event.eventId },
      //   { $inc: { tickets: -Number(createReservationDto.event.tickets) } },
      //   createReservationDto.event,
      //   { session },
      // )

      return newReservation
    }, {
      // readPreference: 'primary',
      // readConcern: { level: 'local' },
      // writeConcern: { w: 'majority' },
      // maxCommitTimeMS: 1000,
      // retryWrites: 5
    }).then((newReservation) => {
      console.log('Transaction succeeded, new reservation is:', newReservation);
      return newReservation
    }).catch(error => {
      this.logger.error(`Transaction Failed: ${error.message}`, error.stack)
    })

    // finally {
    //   session.endSession();
    // }
  }

  
  async findAll() {
    console.log("inside the reservation get");
    try {
        const data = await this.eventsRepository.findAll({});
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}


  async findOne(_id: string) {
    console.log(_id,"asajsjasah")
    return this.eventsRepository.findOne({ _id });
  }

  async updateOne(_id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationsRepository.findOneAndUpdate(
      { _id },
      { $set: updateReservationDto },
    );
  }

  async deleteOne(_id: string) {
    return this.reservationsRepository.findOneAndDelete({ _id });
  }
}
