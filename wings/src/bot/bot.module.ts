import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { DatabaseModule } from 'src/database/database.module';
import { FlightSearchModule } from 'src/flight-search/flight-search.module';

@Module({
  imports: [DatabaseModule, FlightSearchModule],
  providers: [BotService],
  controllers: [BotController],
  exports: [BotService],
})
export class BotModule {}
