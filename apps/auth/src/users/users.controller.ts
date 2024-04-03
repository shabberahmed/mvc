import { Body, Controller, Post, Get, UseGuards, Render, Req, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { CurrentUser } from '../../../../libs/common/src/decorators/current-user.decorator';
import { UserDocument } from './models/user.schema';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Response, Request } from 'express';

@Controller('auth')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @Post('connect')
  async createUser(@Body() createUserDto: CreateUserDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    console.log("createUserDto");
   try{
      await this.userService.create(createUserDto);
    return response.status(200).json({status:"success"})
   }
   catch(err){
    throw err
   }
  
  }

  @Get('signup') 
  // @Render('auth/register')
  signup() {
    const viewData = {}
    return {
      viewData,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@CurrentUser() user: UserDocument) {
    return user;
  }
}

