import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { LoginDto } from './dto/user-login.dto';
import { CurrentUser } from 'src/auth/decoraters/current-user.decorators';
import { CustomThrottlerGuard } from 'src/auth/throttler/throttler.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto);
  }
  // @UseGuards(JwtAuthGuard)
  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // async findOneUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
  //   return await this.userService.findOneUser(id);
  // }

  @UseGuards(JwtAuthGuard, CustomThrottlerGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: any): Promise<User> {
    return await this.userService.findOneUser(user.userId);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async findAllUsers(): Promise<User[]> {
    return await this.userService.findAllUsers();
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUser(id, updateUserDto);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.userService.removeUser(id);
  }
  @Post('login')
  // async login(@Body() body: { email: string; password: string }) {
  async login(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto);
  }
  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<{ access_token: string }> {
    return await this.userService.refreshToken(refreshToken);
  }
}
