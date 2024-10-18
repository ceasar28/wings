import { FlightSearchService } from './flight-search.service';
import { DatabaseService } from 'src/database/database.service';
import { Response } from 'express';
export declare class FlightSearchController {
    private readonly flightSearchService;
    private readonly databaseService;
    constructor(flightSearchService: FlightSearchService, databaseService: DatabaseService);
    deeplink(id: string, token: string, res: Response): Promise<void | {
        url: string;
    }>;
}
