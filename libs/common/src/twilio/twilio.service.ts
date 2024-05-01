import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';
import * as speakeasy from 'speakeasy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwilioService {
  private readonly client: Twilio.Twilio;
  private readonly secret: string; // S ecret used to generate tokens

  constructor(private readonly configService: ConfigService) {
    this.client = new Twilio.Twilio(
      this.configService.get<string>('TWILIO_ID'),
      this.configService.get<string>('TWILIO_SECRET_KEY'),
    );
    this.secret = speakeasy.generateSecret().base32; // Generate secret
  }

  async sendSMS(to: string, body: string) {
    try {
      const message = await this.client.messages.create({
        body,
        from: this.configService.get<string>('TWILIO_NUMBER'),
        to,
      });
      console.log(`Message sent: ${message.sid}`);
      return message;
    } catch (error) {
      console.error(`Error sending message: ${error}`);
      throw error;
    }
  }

  generateOTP(): string {
    return speakeasy.totp({
      secret: this.secret,
      encoding: 'base32',
    });
  }

  verifyOTP(token: string): boolean {
    return speakeasy.totp.verify({
      secret: this.secret,
      encoding: 'base32',
      token: token,
      window: 1,
    });
  }
}
