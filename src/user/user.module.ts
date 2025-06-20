import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],  //! this line not added we get this problem : Repository not found
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService]
})
export class UserModule {}
