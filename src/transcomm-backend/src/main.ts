import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OrdersModule } from 'aggregates/orders/orders.module';
import { AppModule } from 'app.module';
import { AuthModule } from 'auth/auth.module';
import cookieParser from 'cookie-parser';
import { UsersModule } from 'users/users.module';
import { AdminModule } from './admin/admin.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: process.env.LOGGING_LEVEL
        ? JSON.parse(process.env.LOGGING_LEVEL)
        : ['warn', 'error', 'log', 'debug', 'verbose'],
    });
    app.use(cookieParser());

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    const configUsers = new DocumentBuilder()
      .setTitle('DHL Transcomm-backend')
      .setDescription('DHL Transcomm Backend Users API Description')
      .setVersion('1.0')
      .build();
    const documentUsers = SwaggerModule.createDocument(app, configUsers, {
      include: [UsersModule],
    });

    const configAuth = new DocumentBuilder()
      .setTitle('DHL Transcomm-backend')
      .setDescription('DHL Transcomm Backend Auth API Description')
      .addCookieAuth('access-cookie')
      .setVersion('1.0')
      .build();
    const documentAuth = SwaggerModule.createDocument(app, configAuth, {
      include: [AuthModule],
    });

    const configOrders = new DocumentBuilder()
      .setTitle('DHL Transcomm-backend')
      .setDescription('DHL Transcomm Backend Orders API Description')
      .addCookieAuth('access-cookie')
      .setVersion('1.0')
      .build();
    const documentOrders = SwaggerModule.createDocument(app, configOrders, {
      include: [OrdersModule],
    });

    const configAdmin = new DocumentBuilder()
      .setTitle('DHL Transcomm-backend')
      .setDescription('DHL Transcomm Backend Orders API Description')
      .addCookieAuth('access-cookie')
      .setVersion('1.0')
      .build();
    const documentAdmin = SwaggerModule.createDocument(app, configAdmin, {
      include: [AdminModule],
    });

    SwaggerModule.setup('api/orders', app, documentOrders);
    SwaggerModule.setup('api/auth', app, documentAuth);
    SwaggerModule.setup('api/users', app, documentUsers);
    SwaggerModule.setup('api/admin', app, documentAdmin);

    await app.listen(3030);
  } catch (err) {
    Logger.error(`Failed to initialize, due to ${err}, application exiting...`);
    process.exit(1);
  }
}
bootstrap();
