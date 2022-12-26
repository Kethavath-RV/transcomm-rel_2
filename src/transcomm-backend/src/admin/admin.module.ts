import { Module } from '@nestjs/common';
import { DatagenClientModule } from '../datagen-client/datagen-client.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [DatagenClientModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
