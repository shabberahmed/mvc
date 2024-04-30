import { Controller, Get, Post, Body, Req, Res, UseGuards, Render, UseFilters, Put, Param, Delete, OnModuleDestroy, Inject, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CommonAuthGuardMixin, CurrentUser, NotAuthorizedFilter, UserDto } from '@app/common';
import { EventsService } from './events.service';
import { ReservationDto } from './dto/reservation-dto';
import { EventDto } from '@app/common/dto/event-dto';
import { EventsRepository } from './events.repository';
import { Redis } from 'ioredis';
import { Request,Response } from 'express';

@Controller()
export class ReservationsController  {

  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly eventsService: EventsService,
    private readonly eventsRepository: EventsRepository,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
  ) {}



 

  @Post('event')
  async createMe(@Body() createEve: any, @CurrentUser() user: UserDto) {
    await this.eventsService.createEvent(createEve, user);
  }

  @UseGuards(CommonAuthGuardMixin())
  @Post()
  async create(
    @CurrentUser() user: UserDto,
    @Body() createReservationDto: ReservationDto,
    @Req() request:Request ,
    @Res() response: Response,
  ) {
    try {
        console.log('create cure', request.headers);
        const refererHeader = request.headers.referer;
        if (!refererHeader) {
          return response.status(400).json({ error: 'Referer header is missing' });
        }

        const splitOriginUrl = request.headers.referer.split('/');
        const eventId = splitOriginUrl[splitOriginUrl.length - 1];
        const lock = await this.redisClient.set('ticket_lock', 'locked', 'EX', 10, 'NX');
        if (!lock) {
          throw new BadRequestException('Concurrent request in progress, please try again later');
        }
        const event = await this.eventsService.findOneById(eventId);
        console.log(event, 'check bool');
        if (!event) {
          return response.status(404).json({ error: 'Event not found' });
        }

        console.log(event._id, 'this event');

        const cardExpireSplit = createReservationDto.cardexpire.split('/');

        const body = {
          event: {
            tickets: Number(createReservationDto.tickets),
            eventId,
          },
          charge: {
            amount: Number(createReservationDto.tickets) * event.price,
            card: {
              cvc: createReservationDto.cardcvc,
              exp_month: Number(cardExpireSplit[0]),
              exp_year: Number(cardExpireSplit[1]),
              number: createReservationDto.cardnumber,
            },
          },
        };
        if (event.tickets >= body.event.tickets) {
          await this.eventsRepository.findByIdAndUpdate(eventId, {
            $inc: { tickets: -Number(createReservationDto.tickets) },
          });
        } else {
          return response.json({ m: 'tickets not available ' });
        }

    

        if (event.tickets > 0) {
          await this.reservationsService.create(body, user);
        }
        return response.json({ m: 'success' });
      
    } 
    catch (err) {
      return response.json(err.message);
    } finally {
      await this.redisClient.del('ticket_lock');

    }
  
  }
  @Get()
  async findAll(@Req() request, @Res() response: Response) {
    const data = await this.reservationsService.findAll();
    return response.status(200).json(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.updateOne(id, updateReservationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reservationsService.deleteOne(id);
  }

  // views
  @UseGuards(CommonAuthGuardMixin())
  @Get('app')
  @UseFilters(NotAuthorizedFilter)
  @Render('index')
  async root(
    @CurrentUser() user: UserDto,
    @Req() request,
    @Res() response: Response,
  ) {
    const viewdata = {};
    const events = await this.eventsService.findAll();

    return {
      user,
      events,
    };
  }

  // views
  @UseGuards(CommonAuthGuardMixin())
  @Get('app/:id')
  @UseFilters(NotAuthorizedFilter)
  // @Render('form')
  async event(
    @CurrentUser() user: UserDto,
    @Req() request,
    @Res({ passthrough: true }) response: Response,
    @Param('id') id: string,
  ) {
    const viewdata = {};
    const event = await this.eventsService.findOne(id);
    if (!user) return response.json({ m: 'not a user' });

    return response.json({
      user,
      event,
    });
  }
}
