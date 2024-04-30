import { Module } from '@nestjs/common';
import { PaymentrController } from './paymentr.controller';
import { PaymentrService } from './paymentr.service';
import { ConfigModule } from '@nestjs/config';
import * as joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import Payment, { PaymentSchema } from './paymentr.schema';
import { DatabaseModule } from '@app/common';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/paymentr/.env`,
      validationSchema: joi.object({
        HTTP_PORT: joi.number().required(),
        MONGO_URI: joi.string().required(),
        RAZORPAY_API_KEY: joi.string().required(),
        RAZORPAY_APT_SECRET: joi.string().required(),
      }),
    }),
    PaymentrModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
  controllers: [PaymentrController],
  providers: [PaymentrService],
})
export class PaymentrModule {}
