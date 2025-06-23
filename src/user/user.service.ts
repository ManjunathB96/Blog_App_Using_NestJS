import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/user-login.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    // const { password, ...result } = user;
    // return result as User;
    return plainToInstance(User, user, { excludeExtraneousValues: true }); //! when we use @Exclude() then using plainToInstance will exclude the password from the response.
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await this.comparePasswords(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(loginDto: LoginDto): Promise<{
    user: Partial<User>;
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.generateTokens(user);
    return {
      user: { id: user.id, name: user.name, email: user.email },
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  private async generateTokens(user: User) {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return await this.jwtService.sign(payload, {
      secret: process.env.SECRET_KEY,
      expiresIn: '1h',
    });
  }
  private async generateRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id };
    return await this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: '7d',
    });
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }>{
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });
      const user = await this.findOneUser(payload.sub);
      const access_token = await this.generateAccessToken(user);
      return { access_token }
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'name', 'email'], // replace with your actual column names
      order: {
        createdAt: 'ASC', // or 'DESC'
      },
    });
  }
  async findOneUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async updateUser(id: number, updateUserDto: any): Promise<User> {
    await this.findOneUser(id);
    if (updateUserDto?.password) {
      const hashedPassword = await this.hashPassword(updateUserDto.password);
      updateUserDto['password'] = hashedPassword;
    }
    const user = await this.userRepository.update(
      { id: Number(id) },
      updateUserDto,
    );

    const { password, ...result } = user;
    return result as User;
  }
  async removeUser(id: number): Promise<void> {
    return this.userRepository.delete({ id: id });
  }
}
