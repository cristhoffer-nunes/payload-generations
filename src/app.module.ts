import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderController } from './controller/order.controller';
import { OracleService } from './services/oracle.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [OrderController],
  providers: [OracleService],
})
export class AppModule {}
