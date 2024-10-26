// export class PaymentRequestDto {
//     amount: string;
//     mobilephone: string;
//     username: string;
//     password: string;
//     callbackurl: string;
//     transactionId: string;
//     requesttransactionid: string;
//     timestamp: string;
//   }
  
//   export interface PaymentResponse {
//     requesttransactionid: string;
//     transactionid: string;
//     responsecode: string;
//     status: string;
//   }

export interface PaymentRequestDto {
  amount: string;
  mobilephone: string;
  username: string;
  password: string;
  callbackurl: string;
  transactionId: string;
  requesttransactionid: string;
  timestamp: string;
}

export interface PaymentResponse {
  status: string;
  message: string;
  transactionId: string;
}