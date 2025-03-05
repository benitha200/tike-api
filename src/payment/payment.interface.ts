export interface IntouchCallback {
  jsonpayload: {
    requesttransactionid: string;
    status: string;
    responsecode: string;
    [key: string]: any;
  };
}