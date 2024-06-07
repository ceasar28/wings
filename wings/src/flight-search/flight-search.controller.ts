import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { FlightSearchService } from './flight-search.service';

@Controller('flight-search')
export class FlightSearchController {
  constructor(private readonly flightSearchService: FlightSearchService) {}

  //   @Post()
  //   @HttpCode(200)
  //   async paymentCallBackEndpoint(@Body() body: any) {
  //     console.log('this query :', body);
  //     return await this.flightSearchService.notifyPayment(body);
  //   }
}
