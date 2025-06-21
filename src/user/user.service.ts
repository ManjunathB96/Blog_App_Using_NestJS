import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    // const { password, ...result } = user;
    // return result as User;
    return plainToInstance(User, user, { excludeExtraneousValues: true });  //! when we use @Exclude() then using plainToInstance will exclude the password from the response.
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
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
