import { Test, TestingModule } from '@nestjs/testing';
import { PaymentrController } from './paymentr.controller';
import { PaymentrService } from './paymentr.service';

describe('PaymentrController', () => {
  let paymentrController: PaymentrController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentrController],
      providers: [PaymentrService],
    }).compile();

    paymentrController = app.get<PaymentrController>(PaymentrController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(paymentrController.getHello()).toBe('Hello World!');
    });
  });
});
