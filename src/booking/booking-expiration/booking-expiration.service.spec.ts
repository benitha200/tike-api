import { Test, TestingModule } from '@nestjs/testing';
import { BookingExpirationService } from './booking-expiration.service';

describe('BookingExpirationService', () => {
  let service: BookingExpirationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingExpirationService],
    }).compile();

    service = module.get<BookingExpirationService>(BookingExpirationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
