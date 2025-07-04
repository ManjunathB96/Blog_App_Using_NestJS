import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filters';
import { CustomThrottlerGuard } from './auth/throttler/throttler.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false, //! if we make it true we will not get custom validation error
    }),
  );
  // Global Error Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  //app.useGlobalGuards(new CustomThrottlerGuard());   // custom throttler guard

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
