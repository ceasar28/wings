import { Module } from '@nestjs/common';
import { FlightSearchService } from './flight-search.service';

@Module({
  providers: [FlightSearchService]
})
export class FlightSearchModule {}
