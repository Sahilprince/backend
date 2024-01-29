import { Test, TestingModule } from '@nestjs/testing';
import { MainnetController } from './mainnet.controller';

describe('MainnetController', () => {
  let controller: MainnetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MainnetController],
    }).compile();

    controller = module.get<MainnetController>(MainnetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
