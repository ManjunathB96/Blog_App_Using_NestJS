import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.create(createUserDto);
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
    return this.userRepository.update({ id: Number(id) }, updateUserDto);
  }
  async removeUser(id: number): Promise<void> {
    return this.userRepository.delete({ id: id });
  }
}
