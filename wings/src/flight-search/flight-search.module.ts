import { Module } from '@nestjs/common';
import { FlightSearchService } from './flight-search.service';
import { HttpModule } from '@nestjs/axios';
import { FlightSearchController } from './flight-search.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [HttpModule, DatabaseModule],
  providers: [FlightSearchService],
  exports: [FlightSearchService],
  controllers: [FlightSearchController],
})
export class FlightSearchModule {}
