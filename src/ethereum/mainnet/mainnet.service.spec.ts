import { Test, TestingModule } from '@nestjs/testing';
import { MainnetService } from './mainnet.service';

describe('MainnetService', () => {
  let service: MainnetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainnetService],
    }).compile();

    service = module.get<MainnetService>(MainnetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
