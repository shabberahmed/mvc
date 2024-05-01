import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AUTHENTICATE_EVENT, CurrentUser } from '@app/common';
import { UserDocument } from './users/models/user.schema';
import { response, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { error } from 'console';
import { TwilioService } from '@app/common/twilio/twilio.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twilioService: TwilioService,
  ) {}
  Opt: string;
  generateOTP() {
    // Generate a random 4-digit number
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: UserDocument,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(user, response);
    response.send(token);
  }
  // send opt
  @Post('otp')
  async sendOTP(@Body() body: { to: string }) {
    const { to } = body;
    const otp = this.twilioService.generateOTP();
    const message = `Your OTP is: ${otp}`;
    // this.Opt = otp;
    // Send message using TwilioService
    this.twilioService.sendSMS(to, message);

    return { message: 'OTP sent successfully' + otp };
  }
  @Post('verifyOtp')
  async checkOtp(@Body() body: { token: string }, @Res() res: Response) {
    const { token } = body;
    if (this.twilioService.verifyOTP(token)) {
      console.log('in');
      res.cookie('otpstatus', 'true');
      return res.json({ message: 'success' });
    } else {
      console.log('out');
      res.json({ M: 'wrong itp' });
    }
  }
  @UseGuards(JwtAuthGuard)
  @MessagePattern(AUTHENTICATE_EVENT)
  async authenticate(@Payload() data: any) {
    return data.user;
  }

  // views
  // @UseGuards(LocalAuthGuard)
  @Post('/connect')
  async connect(
    @CurrentUser() user: UserDocument,
    @Body() body,
    @Req() request,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (request.cookies.otpstatus === 'true') {
      console.log('OTP verified, sending JWT token');
      const token = await this.authService.login(user, response);
      if (token) {
        return token;
      } else {
        throw new Error('Failed to generate JWT token');
      }
    } else {
      console.log('OTP not verified, cannot send JWT token');
      throw new Error('OTP not verified');
    }
  }
  @Get('/logout')
  // @Redirect('/auth')
  logout(@Req() request, @Res() response: Response) {
    response.clearCookie('Authentication');
    return response.redirect('http://localhost:3000/reservations/app');
  }

  @Get('/signin')
  // @Render('auth/login')
  signin() {
    const viewData = {};
    return {
      viewData,
    };
  }
}
