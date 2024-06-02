import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { FlightSearchModule } from './flight-search/flight-search.module';

@Module({
  imports: [BotModule, FlightSearchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
