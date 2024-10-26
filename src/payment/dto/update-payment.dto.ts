// // update-payment.dto.ts
// import { PaymentStatus } from '../entities/payment.entity';

// export class UpdatePaymentDto {
//   bookingId?: string;
//   amount?: number;
//   phoneNumber?: string;
//   requestTransactionId?: string;
//   status?: PaymentStatus;
// }

import { IsOptional, IsNumber, IsString, IsUUID, IsEnum, IsObject } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentDto {
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  requestTransactionId?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  responseCode?: string;

  @IsOptional()
  @IsObject()
  callbackPayload?: any;
}