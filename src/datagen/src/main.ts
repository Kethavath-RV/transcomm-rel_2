import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HyperledgerModule } from 'hyperledger/hyperledger.module';
import { AppModule } from './app.module';
import { SubscriptionHandlerService } from './subscriptionHandler/subscriptionHandler.service';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: process.env.LOGGING_LEVEL
        ? JSON.parse(process.env.LOGGING_LEVEL)
        : ['warn', 'error', 'log', 'debug', 'verbose'],
    });

    const config = new DocumentBuilder()
      .setTitle('DHL Datagen')
      .setDescription('DHL Datagen API description')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      include: [AppModule],
    });
    SwaggerModule.setup('api', app, document);

    const configHlEvents = new DocumentBuilder()
      .setTitle('DHL Datagen HyperLedger Events Endpoints')
      .setDescription(
        'DHL Datagen HyperLedger Events Endpoints API description',
      )
      .setVersion('1.0')
      .build();

    const documentHlEvents = SwaggerModule.createDocument(app, configHlEvents, {
      include: [HyperledgerModule],
    });

    SwaggerModule.setup('hl-events', app, documentHlEvents);
    app.enableShutdownHooks();

    await app.listen(2020);
    const appService = app.get(SubscriptionHandlerService);
    await appService.createSubscriptions();
    process.on('exit', async function () {
      Logger.warn(
        'About to exit, waiting for remaining connections to complete',
      );
      await app.close();
    });
  } catch (err) {
    Logger.error(
      `Failed to initialize, due to ${err}, application exiting...`,
      JSON.stringify(err),
    );
    process.exit(1);
  }
}
bootstrap();
