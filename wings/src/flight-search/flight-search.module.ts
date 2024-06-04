import { Module } from '@nestjs/common';
import { FlightSearchService } from './flight-search.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [FlightSearchService],
  exports: [FlightSearchService],
})
export class FlightSearchModule {}
