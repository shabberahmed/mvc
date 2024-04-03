import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { EventsService } from './events.service';
import { UserDto } from '@app/common';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() eventData: any, @Req() request, @Res() response: any) {
    const user: UserDto = request.user; // Assuming user data is available in request
    try {
      const createdEvent = await this.eventsService.createEvent(eventData, user);
      return response.status(201).json(createdEvent);
    } catch (error) {
      return response.status(500).json({ error: 'Failed to create event' });
    }
  }
}
