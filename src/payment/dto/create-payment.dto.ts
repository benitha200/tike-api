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
