import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import { FlightSearchService } from './flight-search.service';
import { DatabaseService } from 'src/database/database.service';
import { Response } from 'express';

@Controller('flight-search')
export class FlightSearchController {
  constructor(
    private readonly flightSearchService: FlightSearchService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get(':id')
  // @HttpCode(200)
  // @Redirect()
  async deeplink(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    console.log('this query :', id);
    try {
      const session = await this.databaseService.bookingSession.findFirst({
        where: { id: +id },
      });
      if (token === 'sol') {
        console.log(session.Soldeeplink);
        return res.redirect(307, `${session.Soldeeplink}`);
        // return {
        //   url: `${session.Soldeeplink}`,
        // };
      } else if (token === 'bonk') {
        return { url: `${session.Bonkdeeplink}` };
      } else if (token === 'usdc') {
        return { url: `${session.USDCdeeplink}` };
      }
      return {
        url: 'https://t.me/wingsTravel_bot',
      };
    } catch (error) {
      console.log(error);
    }
  }
}
