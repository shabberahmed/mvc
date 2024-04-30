/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import axios from 'axios';
import shortid from 'shortid';
import Payment from './paymentr.schema';
@Injectable()
export class PaymentrService {
  private razorpay: any;
  private PaymentModel: Model<Payment>; 

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
  ) {
    this.PaymentModel = paymentModel;
    this.razorpay = new Razorpay({
      key_id: configService.get<string>('RAZORPAY_API_KEY'),
      key_secret: configService.get<string>('RAZORPAY_APT_SECRET'),
    });
  }

  instance(): Razorpay {
    return this.razorpay;
  }
 apiKey = this.configService.get<string>('RAZORPAY_API_KEY');
apiSecret = this.configService.get<string>('RAZORPAY_APT_SECRET');
getKey(): number {
  return this.configService.get<number>('RAZORPAY_API_KEY');
}
getSecretKey(): string {
  return this.configService.get<string>('RAZORPAY_APT_SECRET');
}
  async createOrder(amount: number, currency: string): Promise<any> {
    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Amount in paise
        currency: currency,
        receipt: shortid.generate(),
        payment_capture: 1,
      });
      return order;
    } catch (error) {
      console.error('Failed to create Razorpay order:', error);
      throw new HttpException(
        'Failed to create Razorpay order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
 
  // get payments details
  async getPaymentDetails(paymentId: string) {
    try {
      const response = await axios.get(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
        },
      });
  
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching payment details: ${error.message}`);
    }
  }
  async verifyPayment(paymentDetails: any) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      paymentDetails;
     const check=await this.getPaymentDetails(razorpay_payment_id)
    if(check.status=="captured"){
      
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        'sha256',
        this.configService.get<string>('RAZORPAY_APT_SECRET'),
      )
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
      // Payment verification successful
      await this.PaymentModel.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_method:check.method,
        amount:check.amount+check.currency
      });
      return { success: true };
    }
    } else {
      // Invalid signature
      return { success: false, error: 'Invalid signature' };
    }
  }
   // send basic auth from razorpay
 async getBasicAuth(): Promise<string> {
  try {
    const response = await axios.get(`https://api.razorpay.com/v1/payments/`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(`Error fetching payment details: ${error.message}`);
  }

  }
}
