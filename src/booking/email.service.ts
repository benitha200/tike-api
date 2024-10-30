// // email.service.ts
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as nodemailer from 'nodemailer';
// import { Booking } from './entities/booking.entity';

// @Injectable()
// export class EmailService {
//   private transporter;

//   constructor(private configService: ConfigService) {
//     this.transporter = nodemailer.createTransport({
//       host: this.configService.get('SMTP_HOST'),
//       port: this.configService.get('SMTP_PORT'),
//       secure: true,
//       auth: {
//         user: this.configService.get('SMTP_USER'),
//         pass: this.configService.get('SMTP_PASSWORD'),
//       },
//     });
//   }

//   async sendTicketEmail(booking: Booking): Promise<void> {
//     const { traveler, trip } = booking;
    
//     const departureTime = new Date(trip.departure_time).toLocaleString();
//     const arrivalTime = new Date(trip.arrival_time).toLocaleString();

//     const emailContent = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2>Your Bus Ticket Confirmation</h2>
//         <p>Dear ${traveler.fullname},</p>
        
//         <p>Your payment has been confirmed. Here are your trip details:</p>
        
//         <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
//           <h3>Trip Information</h3>
//           <p><strong>Booking Reference:</strong> ${booking.payment_reference}</p>
//           <p><strong>From:</strong> ${trip.departure_location.name}</p>
//           <p><strong>To:</strong> ${trip.arrival_location.name}</p>
//           <p><strong>Departure:</strong> ${departureTime}</p>
//           <p><strong>Arrival:</strong> ${arrivalTime}</p>
//           <p><strong>Bus Number:</strong> ${trip.car.car_no}</p>
//           <p><strong>Operator:</strong> ${trip.operator.name}</p>
//           <p><strong>Amount Paid:</strong> RWF ${booking.price}</p>
//         </div>
        
//         <div style="margin-top: 20px;">
//           <p><strong>Important Notes:</strong></p>
//           <ul>
//             <li>Please arrive at least 30 minutes before departure time</li>
//             <li>Present this email or booking reference at the bus station</li>
//             <li>For any queries, contact ${trip.operator.support_phone}</li>
//           </ul>
//         </div>
        
//         <p>Thank you for choosing ${trip.operator.name}!</p>
//       </div>
//     `;

//     await this.transporter.sendMail({
//       from: this.configService.get('SMTP_FROM_EMAIL'),
//       to: traveler.email,
//       subject: `Bus Ticket Confirmation - ${booking.payment_reference}`,
//       html: emailContent,
//     });
//   }
// }

// email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Booking } from './entities/booking.entity';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  private getEmailTemplate(booking: Booking): string {
    const departureTime = new Date(booking.trip.departure_time).toLocaleString();
    const arrivalTime = new Date(booking.trip.arrival_time).toLocaleString();

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${booking.payment_status === 'PAID' ? 'Payment Successful - Your Bus Ticket' : 'Booking Payment Status Update'}</h2>
        <p>Dear ${booking.traveler.fullname},</p>
        
        ${
          booking.payment_status === 'PAID'
            ? `<p>Your payment has been confirmed. Here are your trip details:</p>`
            : booking.payment_status === 'FAILED'
            ? `<p>Unfortunately, your payment was unsuccessful. Please try again or contact support for assistance.</p>`
            : `<p>Your payment is currently pending. We'll update you once it's confirmed.</p>`
        }
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Trip Information</h3>
          <p><strong>Booking Reference:</strong> ${booking.payment_reference}</p>
          <p><strong>From:</strong> ${booking.trip.departure_location.name}</p>
          <p><strong>To:</strong> ${booking.trip.arrival_location.name}</p>
          <p><strong>Departure:</strong> ${departureTime}</p>
          <p><strong>Arrival:</strong> ${arrivalTime}</p>
          <p><strong>Bus Number:</strong> ${booking.trip.car.car_no}</p>
          <p><strong>Operator:</strong> ${booking.trip.operator.name}</p>
          <p><strong>Amount:</strong> RWF ${booking.price}</p>
          <p><strong>Payment Status:</strong> ${booking.payment_status}</p>
        </div>
        
        ${
          booking.payment_status === 'PAID'
            ? `
            <div style="margin-top: 20px;">
              <p><strong>Important Notes:</strong></p>
              <ul>
                <li>Please arrive at least 30 minutes before departure time</li>
                <li>Present this email or booking reference at the bus station</li>
                <li>For any queries, contact ${booking.trip.operator.support_phone}</li>
              </ul>
            </div>
            `
            : ''
        }
        
        <div style="margin-top: 20px;">
          <p>If you have any questions or concerns, please contact our support team:</p>
          <p>Phone: ${booking.trip.operator.support_phone}</p>
          ${booking.trip.operator.support_email ? `<p>Email: ${booking.trip.operator.support_email}</p>` : ''}
        </div>
        
        <p>Thank you for choosing ${booking.trip.operator.name}!</p>
      </div>
    `;
  }

  async sendPaymentStatusEmail(booking: Booking): Promise<void> {
    const subject = 
      booking.payment_status === 'PAID'
        ? `Bus Ticket Confirmation - ${booking.payment_reference}`
        : booking.payment_status === 'FAILED'
        ? `Payment Failed - ${booking.payment_reference}`
        : `Payment Pending - ${booking.payment_reference}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM_EMAIL'),
        to: booking.traveler.email,
        subject: subject,
        html: this.getEmailTemplate(booking),
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw the error to prevent it from affecting the booking update
    }
  }
}