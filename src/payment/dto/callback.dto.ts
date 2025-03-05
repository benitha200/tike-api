import { ApiProperty } from '@nestjs/swagger';

export class IntouchCallbackDto {
  @ApiProperty({
    type: 'object',
    properties: {
      requesttransactionid: { type: 'string' },
      transactionid: { type: 'string' },
      responsecode: { type: 'string' },
      status: { type: 'string' }
    }
  })
  jsonpayload: {
    requesttransactionid: string;
    transactionid: string;
    responsecode: string;
    status: string;
  };
}