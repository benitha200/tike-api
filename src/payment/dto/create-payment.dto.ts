// // create-payment.dto.ts
// import { PaymentStatus } from '../entities/payment.entity';

// export class CreatePaymentDto {
//   bookingId: string;
//   amount: number;
//   phoneNumber: string;
//   requestTransactionId: string;
//   status: PaymentStatus;
// }


import { IsNotEmpty, IsNumber, IsString, IsUUID, IsEnum } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  requestTransactionId: string;

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
