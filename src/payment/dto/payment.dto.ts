export class PaymentRequestDto {
    amount: string;
    mobilephone: string;
    username: string;
    password: string;
    callbackurl: string;
  }
  
  export interface PaymentResponse {
    requesttransactionid: string;
    transactionid: string;
    responsecode: string;
    status: string;
  }