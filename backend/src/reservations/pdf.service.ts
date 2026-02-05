import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  generateTicket(reservation: any): Buffer {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.fontSize(25).text('TICKET EVENEMENT', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(18).text(`Event: ${reservation.eventId.title}`);
    doc.fontSize(14).text(`Date: ${new Date(reservation.eventId.date).toDateString()}`);
    doc.text(`Lieu: ${reservation.eventId.location}`);
    doc.moveDown();
    
    doc.fontSize(16).text(`Participant: ${reservation.userId.fullName}`);
    doc.text(`Email: ${reservation.userId.email}`);
    doc.moveDown();
    
    doc.fontSize(12).text(`Ticket ID: ${reservation._id}`);
    doc.fillColor('green').text(`Status: ${reservation.status}`, { align: 'right' });

    doc.end();
    
    return Buffer.concat(buffers);
  }
}