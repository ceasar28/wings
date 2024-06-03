import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { FlightSearchModule } from './flight-search/flight-search.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [BotModule, FlightSearchModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
