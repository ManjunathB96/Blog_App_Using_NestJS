import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 5,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.TYPEORM_SYNC === 'true',
      // entities: [__dirname + '/**/*.entity{.ts,.js}'],
      entities: [User],
    }),

    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

//      __dirname                  :  Current directory path (where the config file is located).

//      '/**/*.entity{.ts,.js}'    : Glob pattern to find all files ending with .entity.ts or .entity.js recursively in all subfolders.

//      **/                         :  Recursively searches all subdirectories.

//      *.entity{.ts,.js}            :  Matches both .entity.ts (used in development) and .entity.js (used after TypeScript compilation).

/*
  TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
         synchronize: config.get<string>('TYPEORM_SYNC') === 'true',
           }),
    }),
*/
// entities: [__dirname + '/**/*.entity{.ts,.js}'],
