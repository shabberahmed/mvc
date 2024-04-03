import { CardDto, CreateChargeDto } from '@app/common';
import { EventDto } from '@app/common/dto/event-dto';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsNotEmpty,
    IsDefined,
    ValidateNested,
} from 'class-validator';
import { ReservationDocument } from '../models/reservation.schema';

export class ReservationDto {
    @IsDefined()
    @IsNotEmpty()
    eventname: string

    @IsDefined()
    @IsNotEmpty()
    email: string

    @IsDefined()
    @IsNotEmpty()
    tickets: number

    @IsDefined()
    @IsNotEmpty()
    cardnumber: string

    @IsDefined()
    @IsNotEmpty()
    cardexpire: string

    @IsDefined()
    @IsNotEmpty()
    cardcvc: string
  event: Omit<ReservationDocument, "_id">;
}
