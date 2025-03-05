// import { Test, TestingModule } from '@nestjs/testing';
// import { PaymentController } from './payment.controller';
// import { PaymentService } from './payment.service';
// import { CreatePaymentDto } from './dto/create-payment.dto';
// import { UpdatePaymentDto } from './dto/update-payment.dto';
// import { Payment } from './entities/payment.entity';
// import { InterceptDto } from '../shared/dto/intercept.dto';

// describe('PaymentController', () => {
//   let controller: PaymentController;
//   let service: PaymentService;

//   const mockPaymentService = {
//     create: jest.fn(),
//     findAll: jest.fn(),
//     findOne: jest.fn(),
//     update: jest.fn(),
//     remove: jest.fn(),
//     processPayment: jest.fn(),
//     handlePaymentCallback: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [PaymentController],
//       providers: [
//         {
//           provide: PaymentService,
//           useValue: mockPaymentService,
//         },
//       ],
//     }).compile();

//     controller = module.get<PaymentController>(PaymentController);
//     service = module.get<PaymentService>(PaymentService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('create', () => {
//     it('should create a payment', async () => {
//       const createPaymentDto: CreatePaymentDto = {
//         amount: 100,
//         phoneNumber: '1234567890',
//         bookingId: 'booking-123',
//         requestTransactionId: 'trans-123',
//         status: 'pending'
//       };
//       const result = new Payment();
      
//       jest.spyOn(service, 'create').mockResolvedValue(result);
      
//       expect(await controller.create(createPaymentDto)).toBe(result);
//       expect(service.create).toHaveBeenCalledWith(createPaymentDto);
//     });
//   });

//   describe('findAll', () => {
//     it('should return an array of payments', async () => {
//       const result = [new Payment()];
//       const intercept = new InterceptDto();
      
//       jest.spyOn(service, 'findAll').mockResolvedValue(result);
      
//       expect(await controller.findAll(intercept)).toBe(result);
//       expect(service.findAll).toHaveBeenCalledWith(intercept);
//     });
//   });

//   describe('findOne', () => {
//     it('should return a payment', async () => {
//       const result = new Payment();
//       const intercept = new InterceptDto();
      
//       jest.spyOn(service, 'findOne').mockResolvedValue(result);
      
//       expect(await controller.findOne('1', intercept)).toBe(result);
//       expect(service.findOne).toHaveBeenCalledWith('1', intercept);
//     });
//   });

//   describe('update', () => {
//     it('should update a payment', async () => {
//       const updatePaymentDto: UpdatePaymentDto = {
//         status: 'completed',
//       };
      
//       jest.spyOn(service, 'update').mockResolvedValue(new Payment());
      
//       expect(await controller.update('1', updatePaymentDto)).toBe('Updated');
//       expect(service.update).toHaveBeenCalledWith('1', updatePaymentDto);
//     });
//   });

//   describe('remove', () => {
//     it('should remove a payment', async () => {
//       const intercept = new InterceptDto();
      
//       jest.spyOn(service, 'remove').mockResolvedValue(undefined);
      
//       expect(await controller.remove('1', intercept)).toBe('Deleted');
//       expect(service.remove).toHaveBeenCalledWith('1', intercept);
//     });
//   });

//   describe('processPayment', () => {
//     it('should process a payment', async () => {
//       const paymentData = {
//         amount: 100,
//         phoneNumber: '1234567890',
//       };
//       const result = new Payment();
      
//       jest.spyOn(service, 'processPayment').mockResolvedValue(result);
      
//       expect(await controller.processPayment('booking-id', paymentData)).toBe(result);
//       expect(service.processPayment).toHaveBeenCalledWith(
//         'booking-id',
//         paymentData.amount,
//         paymentData.phoneNumber,
//       );
//     });
//   });

//   describe('handleCallback', () => {
//     it('should handle payment callback', async () => {
//       const callback = {
//         transactionId: '123',
//         status: 'success',
//       };
      
//       jest.spyOn(service, 'handlePaymentCallback').mockResolvedValue(undefined);
      
//     //   expect(await controller.handleCallback(callback)).toEqual({
//     //     message: 'Callback processed successfully',
//     //   });
//       expect(service.handlePaymentCallback).toHaveBeenCalledWith(callback);
//     });
//   });
// });


