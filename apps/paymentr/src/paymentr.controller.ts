/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { PaymentrService } from './paymentr.service';

@Controller()
export class PaymentrController {
  @Get('key')
  getHello(@Res() res: any): any {
    const response = this.paymentService.getKey();
    return res.json({ m: response });
  }

  @Get('secretkey')
  getData(): string {
    return this.paymentService.getSecretKey();
  }
  constructor(private readonly paymentService: PaymentrService) {}
  @Post()
  async checkout(@Body() body: any) {
    const { amount, currency } = body;
    const order = await this.paymentService.createOrder(amount, currency);
    return {
      success: true,
      order,
    };
  }
  // 
  @Get(':paymentId')
  async getPaymentDetails(@Param('paymentId') paymentId: string) {
    return this.paymentService.getPaymentDetails(paymentId);
  }
  @Post('verify')
  async verifyPayment(
    @Body() paymentDetails: any,
    @Res() res: any,
  ): Promise<any> {
    try {
      const verificationResult =
        await this.paymentService.verifyPayment(paymentDetails);
      if (verificationResult.success) {
        return res.redirect(
          `http://localhost:4200/payment-success?reference=${paymentDetails.razorpay_payment_id}`,
        );
      } else {
        throw new HttpException(
          verificationResult.error,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
      throw new HttpException(
        'Failed to verify payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('base/auth')
  async PaymentAut(@Res() res: any):Promise<any>{
    try{
      const auth=await this.paymentService.getBasicAuth()
    return res.json({auth})
    }
    catch(err){
      res.json({err})
    }
  }
}
