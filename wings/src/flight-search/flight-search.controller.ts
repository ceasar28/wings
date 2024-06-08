import { Controller, Get, HttpCode, Param, Redirect } from '@nestjs/common';
import { FlightSearchService } from './flight-search.service';
import { DatabaseService } from 'src/database/database.service';

@Controller('flight-search')
export class FlightSearchController {
  constructor(
    private readonly flightSearchService: FlightSearchService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get(':id')
  @HttpCode(200)
  @Redirect()
  async deeplink(@Param('id') id: string) {
    console.log('this query :', id);
    try {
      const session = await this.databaseService.bookingSession.findFirst({
        where: { id: +id },
      });
      if (session.deeplink) {
        return {
          url: `${session.deeplink}`,
        };
      }
      return {
        url: 'https://t.me/wingsTravel_bot',
      };
    } catch (error) {
      console.log(error);
    }
  }
}
