import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    dataSource: DataSource, // ✅ Don’t redeclare with private/protected
  ) {
    super(userRepository, dataSource);
  }
}
