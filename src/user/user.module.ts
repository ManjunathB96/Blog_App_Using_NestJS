import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Module({
  //Purpose: Registers the User entity for this module
  //TypeOrmModule.forFeature() tells NestJS: “Hey, we want to work with these entities and their repositories in this module.”
  imports: [
    TypeOrmModule.forFeature([User]),
     JwtModule.register({}),
    // JwtModule.register({
    //   secret: String(process.env.SECRET_KEY),
    //   signOptions: { expiresIn: '1h' },
    // }),
  ], //!TypeOrmModule.forFeature([User]) this line not added we get this problem : Repository not found
  controllers: [UserController], //Controller handles incoming HTTP requests and routes them to the service.
  providers: [
    UserService,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: UserRepository, //Custom provider definition.  You are telling Nest how to create and inject your custom UserRepository (which is likely a class that extends Repository<User>).
      useFactory: (dataSource: DataSource) => {
        //Factory function that builds the custom UserRepository.
        return new UserRepository(dataSource.getRepository(User), dataSource); //It uses the global DataSource to get the default repository for User, then passes it to your custom repository class.
      },
      inject: [DataSource], //Tells Nest to inject the DataSource object (provided by TypeORM) into the useFactory function.
    },
  ],
  exports: [UserService],
})
export class UserModule {}
