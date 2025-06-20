import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(): Promise<User> {
    const userData = {
      name: 'manjunath',
      email: 'manjunath@gmail.com',
      password: '12345678',
      role: 'user',
    };
    const user= await this.userRepository.create(userData);
    return await this.userRepository.save(user)
  }
}
