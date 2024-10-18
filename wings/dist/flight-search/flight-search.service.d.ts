/// <reference types="@solana/web3.js" />
import { HttpService } from '@nestjs/axios';
import { DatabaseService } from 'src/database/database.service';
export declare class FlightSearchService {
    private readonly httpService;
    private readonly databaseService;
    private connection;
    constructor(httpService: HttpService, databaseService: DatabaseService);
    searchAirport: (query: string) => Promise<any>;
    searchAvailableOneWayFlight: (query: any) => Promise<{
        token: any;
        completeFlights: any;
    }>;
    searchAvailableReturnFlight: (query: any) => Promise<{
        token: any;
        completeFlights: any;
    }>;
    searchAvailableMulticityFlight: (payload: any) => Promise<{
        token: any;
        completeFlights: any;
    }>;
    searchFlightDetails: (session: any) => Promise<{
        firstName: any;
        lastName: any;
        email: any;
        summary: any;
        airline: any;
        price: any;
        flightDeeplinks: any[];
    }>;
    generateSolanaPayUrl: (payload: any) => Promise<{
        url: string;
        ref: string;
    }>;
    generateUSDCPayUrl: (payload: any) => Promise<{
        url: string;
        ref: string;
    }>;
    generateBonkPayUrl: (payload: any) => Promise<{
        url: string;
        ref: string;
    }>;
    verifySOLTransaction: (Id: any) => Promise<import("@solana/web3.js").TransactionResponse | {
        status: string;
        message: string;
    }>;
    verifyUSDCTransaction: (Id: any) => Promise<import("@solana/web3.js").TransactionResponse | {
        status: string;
        message: string;
    }>;
    verifyBonkTransaction: (Id: any) => Promise<import("@solana/web3.js").TransactionResponse | {
        status: string;
        message: string;
    }>;
}
