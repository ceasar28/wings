import { Module } from '@nestjs/common';
import { FlightSearchService } from './flight-search.service';
import { HttpModule } from '@nestjs/axios';
import { FlightSearchController } from './flight-search.controller';

@Module({
  imports: [HttpModule],
  providers: [FlightSearchService],
  exports: [FlightSearchService],
  controllers: [FlightSearchController],
})
export class FlightSearchModule {}
