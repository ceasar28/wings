import { Test, TestingModule } from '@nestjs/testing';
import { FlightSearchService } from './flight-search.service';

describe('FlightSearchService', () => {
  let service: FlightSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlightSearchService],
    }).compile();

    service = module.get<FlightSearchService>(FlightSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
