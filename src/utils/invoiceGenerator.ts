import jsPDF from 'jspdf';
import { Booking, ROOM_TYPE_CONFIGS } from '../types/hotel';

/**
 * Generates a clean, standalone, print-optimized HTML string for the invoice.
 */
export function generateInvoiceHTML(booking: Booking): string {
  const roomConfig = ROOM_TYPE_CONFIGS[booking.roomType];
  const nowStr = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const statusColor =
    booking.status === 'COMPLETED'
      ? '#059669'
      : booking.status === 'IN_HOUSE'
      ? '#0284c7'
      : booking.status === 'RESERVED'
      ? '#d97706'
      : '#e11d48';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${booking.bookingId} - Grand Horizon Hotel</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      padding: 32px 40px;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 780px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .hotel-brand h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .hotel-brand p {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .invoice-number {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      font-size: 14px;
      color: #0284c7;
      margin-top: 2px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #ffffff;
      background-color: ${statusColor};
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .info-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
    }
    .info-box-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .info-label {
      color: #64748b;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .items-table th {
      background-color: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 10px 14px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table th.text-right {
      text-align: right;
    }
    .items-table th.text-center {
      text-align: center;
    }
    .items-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }
    .items-table td.text-right {
      text-align: right;
    }
    .items-table td.text-center {
      text-align: center;
    }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }
    .totals-table {
      width: 320px;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 6px 12px;
      font-size: 12px;
    }
    .totals-table tr.total-row {
      font-weight: 700;
      font-size: 14px;
      border-top: 2px solid #0f172a;
      border-bottom: 2px solid #0f172a;
      background-color: #f8fafc;
    }
    .totals-table tr.balance-row {
      font-weight: 800;
      font-size: 14px;
      color: ${booking.billing.balanceDue > 0 ? '#b91c1c' : '#059669'};
      background-color: ${booking.billing.balanceDue > 0 ? '#fef2f2' : '#f0fdf4'};
    }
    .cancellation-notice {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      color: #991b1b;
      font-size: 12px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
    }
    .signatures {
      display: flex;
      gap: 40px;
      margin-top: 20px;
    }
    .signature-line {
      width: 160px;
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      text-align: center;
      font-size: 10px;
      color: #475569;
    }
    .no-print-bar {
      margin-bottom: 20px;
      text-align: center;
    }
    .print-btn {
      background-color: #0284c7;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .print-btn:hover {
      background-color: #0369a1;
    }
    @media print {
      body {
        padding: 0;
      }
      .invoice-card {
        border: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="print-btn" onclick="window.print()">Print / Save PDF Now</button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div class="hotel-brand">
        <h1>Grand Horizon Hotel</h1>
        <p>100 Horizon Boulevard, Luxury District • Phone: +1 (800) 555-0199</p>
        <p>Email: reservations@grandhorizon.hotel • GSTIN: 29AAAAA0000A1Z5</p>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">TAX INVOICE / FOLIO</div>
        <div class="invoice-number">INV-${booking.bookingId}</div>
        <div><span class="status-badge">${booking.status}</span></div>
        <p style="font-size: 11px; color: #64748b; margin-top: 6px;">Issued: ${nowStr}</p>
      </div>
    </div>

    ${
      booking.status === 'CANCELLED' && booking.cancellationReason
        ? `<div class="cancellation-notice">
            <strong>RESERVATION CANCELLED:</strong> ${booking.cancellationReason}
            ${booking.cancelledAt ? `<span style="float: right;">Cancelled on ${new Date(booking.cancelledAt).toLocaleDateString()}</span>` : ''}
          </div>`
        : ''
    }

    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-title">Guest Profile</div>
        <div class="info-row">
          <span class="info-label">Guest Name:</span>
          <span class="info-value">${booking.guest.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">${booking.guest.phone || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${booking.guest.email || 'N/A'}</span>
        </div>
        ${
          booking.guest.idNumber
            ? `<div class="info-row">
                <span class="info-label">ID Proof:</span>
                <span class="info-value">${booking.guest.idType || 'ID'}: ${booking.guest.idNumber}</span>
              </div>`
            : ''
        }
        <div class="info-row">
          <span class="info-label">Party Size:</span>
          <span class="info-value">${booking.guest.numberOfGuests || 1} Guest(s)</span>
        </div>
      </div>

      <div class="info-box">
        <div class="info-box-title">Reservation Specifics</div>
        <div class="info-row">
          <span class="info-label">Room Number:</span>
          <span class="info-value">Room #${booking.roomNumber} (${roomConfig?.name || booking.roomType})</span>
        </div>
        <div class="info-row">
          <span class="info-label">Check-In Date:</span>
          <span class="info-value">${booking.checkInDate} (From 2:00 PM)</span>
        </div>
        <div class="info-row">
          <span class="info-label">Check-Out Date:</span>
          <span class="info-value">${booking.checkOutDate} (Until 11:00 AM)</span>
        </div>
        <div class="info-row">
          <span class="info-label">Stay Duration:</span>
          <span class="info-value">${booking.nights} ${booking.nights === 1 ? 'Night' : 'Nights'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Booking Date:</span>
          <span class="info-value">${new Date(booking.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-center">Rate / Unit</th>
          <th class="text-center">Qty / Duration</th>
          <th class="text-right">Amount (Rs.)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${roomConfig?.name || booking.roomType} — Accommodation</strong><br>
            <span style="font-size: 11px; color: #64748b;">Includes room access, high-speed Wi-Fi, and standard amenities</span>
          </td>
          <td class="text-center">Rs. ${booking.billing.nightlyRate.toFixed(2)}</td>
          <td class="text-center">${booking.nights} night(s)</td>
          <td class="text-right font-bold">Rs. ${booking.billing.roomCharges.toFixed(2)}</td>
        </tr>
        ${
          booking.billing.extraCharges > 0
            ? `<tr>
                <td>
                  <strong>Room Service &amp; Incidentals</strong><br>
                  <span style="font-size: 11px; color: #64748b;">Minibar, dining, and auxiliary hotel services</span>
                </td>
                <td class="text-center">—</td>
                <td class="text-center">1</td>
                <td class="text-right">Rs. ${booking.billing.extraCharges.toFixed(2)}</td>
              </tr>`
            : ''
        }
        ${
          booking.billing.discountAmount > 0
            ? `<tr>
                <td>
                  <strong style="color: #059669;">Special Promotional Discount</strong>
                </td>
                <td class="text-center">—</td>
                <td class="text-center">—</td>
                <td class="text-right" style="color: #059669;">-Rs. ${booking.billing.discountAmount.toFixed(2)}</td>
              </tr>`
            : ''
        }
        <tr>
          <td>
            <strong>Goods &amp; Services Tax (GST ${booking.billing.taxRatePercent || 10}%)</strong><br>
            <span style="font-size: 11px; color: #64748b;">Statutory hospitality government tax</span>
          </td>
          <td class="text-center">${booking.billing.taxRatePercent || 10}%</td>
          <td class="text-center">—</td>
          <td class="text-right">Rs. ${booking.billing.taxAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals-area">
      <table class="totals-table">
        <tr>
          <td style="color: #64748b;">Room Subtotal:</td>
          <td class="text-right" style="font-weight: 600;">Rs. ${booking.billing.roomCharges.toFixed(2)}</td>
        </tr>
        ${
          booking.billing.extraCharges > 0
            ? `<tr>
                <td style="color: #64748b;">Incidentals:</td>
                <td class="text-right" style="font-weight: 600;">Rs. ${booking.billing.extraCharges.toFixed(2)}</td>
              </tr>`
            : ''
        }
        <tr>
          <td style="color: #64748b;">Applicable Tax (GST):</td>
          <td class="text-right" style="font-weight: 600;">Rs. ${booking.billing.taxAmount.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>Grand Total:</td>
          <td class="text-right">Rs. ${booking.billing.totalAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="color: #059669; font-weight: 600;">Advance Deposit Paid:</td>
          <td class="text-right" style="color: #059669; font-weight: 700;">Rs. ${booking.billing.depositPaid.toFixed(2)}</td>
        </tr>
        <tr class="balance-row">
          <td>Net Balance Due:</td>
          <td class="text-right">Rs. ${booking.billing.balanceDue.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <div>
        <p><strong>Thank you for choosing Grand Horizon Hotel!</strong></p>
        <p>For queries regarding this invoice, contact accounts@grandhorizon.hotel.</p>
        <p style="margin-top: 4px; font-size: 10px;">This is a computer-generated receipt requiring no physical signature.</p>
      </div>

      <div class="signatures">
        <div class="signature-line">Guest Signature</div>
        <div class="signature-line">Authorized Front Desk</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads a crisp, multi-element PDF invoice directly to the user's system.
 */
export function downloadInvoicePDF(booking: Booking): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const roomConfig = ROOM_TYPE_CONFIGS[booking.roomType];

  // Colors
  const darkNavy = [15, 23, 42];
  const primaryBlue = [2, 132, 199];
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];
  const tableHeaderBg = [241, 245, 249];

  // Header Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('GRAND HORIZON HOTEL', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('100 Horizon Boulevard • Phone: +1 800-555-0199 • reservations@grandhorizon.hotel', 14, 22);
  doc.text('GSTIN / Tax ID: 29AAAAA0000A1Z5 • ISO 9001:2020 Certified Hospitality', 14, 27);

  // Invoice Title & Status in Header Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', 196, 14, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(56, 189, 248);
  doc.text(`INV-${booking.bookingId}`, 196, 20, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`STATUS: ${booking.status}`, 196, 26, { align: 'right' });

  let y = 42;

  // Guest Details Box & Stay Details Box
  // Left Box: Guest
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 88, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('GUEST PROFILE', 18, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(booking.guest.name, 18, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Phone: ${booking.guest.phone || 'N/A'}`, 18, y + 19);
  doc.text(`Email: ${booking.guest.email || 'N/A'}`, 18, y + 24);
  doc.text(`ID: ${booking.guest.idType || 'ID'} - ${booking.guest.idNumber || 'Verified at Desk'}`, 18, y + 29);
  doc.text(`Party: ${booking.guest.numberOfGuests || 1} Guest(s)`, 18, y + 34);

  // Right Box: Reservation Details
  doc.roundedRect(108, y, 88, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('RESERVATION SPECIFICS', 112, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Room #${booking.roomNumber} (${roomConfig?.name || booking.roomType})`, 112, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Check-In:  ${booking.checkInDate} (2:00 PM)`, 112, y + 19);
  doc.text(`Check-Out: ${booking.checkOutDate} (11:00 AM)`, 112, y + 24);
  doc.text(`Duration:  ${booking.nights} ${booking.nights === 1 ? 'Night' : 'Nights'} stay`, 112, y + 29);
  doc.text(`Folio Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 112, y + 34);

  y += 44;

  // If Cancelled Banner
  if (booking.status === 'CANCELLED') {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(14, y, 182, 10, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(185, 28, 28);
    doc.text(`RESERVATION CANCELLED: ${booking.cancellationReason || 'Guest requested cancellation'}`, 18, y + 6.5);
    y += 14;
  }

  // Items Table Header
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DESCRIPTION', 18, y + 5.5);
  doc.text('UNIT RATE', 110, y + 5.5, { align: 'center' });
  doc.text('QTY / DURATION', 145, y + 5.5, { align: 'center' });
  doc.text('AMOUNT (Rs.)', 192, y + 5.5, { align: 'right' });

  y += 8;

  // Line 1: Accommodation
  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 10, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y + 10, 196, y + 10);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`${roomConfig?.name || booking.roomType} Accommodation`, 18, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Room tariff including Wi-Fi and complimentary amenities', 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Rs. ${booking.billing.nightlyRate.toFixed(2)}`, 110, y + 6, { align: 'center' });
  doc.text(`${booking.nights} night(s)`, 145, y + 6, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${booking.billing.roomCharges.toFixed(2)}`, 192, y + 6, { align: 'right' });

  y += 10;

  // Line 2: Extra Charges (if any)
  if (booking.billing.extraCharges > 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 8, 'F');
    doc.line(14, y + 8, 196, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text('Room Service & Incidentals', 18, y + 5.5);
    doc.text('—', 110, y + 5.5, { align: 'center' });
    doc.text('1', 145, y + 5.5, { align: 'center' });
    doc.text(`Rs. ${booking.billing.extraCharges.toFixed(2)}`, 192, y + 5.5, { align: 'right' });
    y += 8;
  }

  // Line 3: Discount (if any)
  if (booking.billing.discountAmount > 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 8, 'F');
    doc.line(14, y + 8, 196, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105);
    doc.text('Promotional Discount', 18, y + 5.5);
    doc.text('—', 110, y + 5.5, { align: 'center' });
    doc.text('—', 145, y + 5.5, { align: 'center' });
    doc.text(`-Rs. ${booking.billing.discountAmount.toFixed(2)}`, 192, y + 5.5, { align: 'right' });
    y += 8;
  }

  // Line 4: GST
  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 8, 'F');
  doc.line(14, y + 8, 196, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Goods & Services Tax (GST ${booking.billing.taxRatePercent || 10}%)`, 18, y + 5.5);
  doc.text(`${booking.billing.taxRatePercent || 10}%`, 110, y + 5.5, { align: 'center' });
  doc.text('—', 145, y + 5.5, { align: 'center' });
  doc.text(`Rs. ${booking.billing.taxAmount.toFixed(2)}`, 192, y + 5.5, { align: 'right' });
  y += 12;

  // Totals Box (Right Aligned)
  const totalsX = 118;
  const totalsW = 78;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsX, y, totalsW, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Room Charges:', totalsX + 4, y + 6);
  doc.text(`Rs. ${booking.billing.roomCharges.toFixed(2)}`, 192, y + 6, { align: 'right' });

  doc.text(`GST (${booking.billing.taxRatePercent || 10}%):`, totalsX + 4, y + 12);
  doc.text(`Rs. ${booking.billing.taxAmount.toFixed(2)}`, 192, y + 12, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Grand Total:', totalsX + 4, y + 19);
  doc.text(`Rs. ${booking.billing.totalAmount.toFixed(2)}`, 192, y + 19, { align: 'right' });

  doc.setTextColor(5, 150, 105);
  doc.text('Deposit Paid:', totalsX + 4, y + 25);
  doc.text(`Rs. ${booking.billing.depositPaid.toFixed(2)}`, 192, y + 25, { align: 'right' });

  // Net Balance
  doc.setFillColor(booking.billing.balanceDue > 0 ? 254 : 240, booking.billing.balanceDue > 0 ? 242 : 253, booking.billing.balanceDue > 0 ? 242 : 244);
  doc.rect(totalsX, y + 28, totalsW, 8, 'F');
  doc.setTextColor(booking.billing.balanceDue > 0 ? 185 : 5, booking.billing.balanceDue > 0 ? 28 : 150, booking.billing.balanceDue > 0 ? 28 : 105);
  doc.text('Net Balance Due:', totalsX + 4, y + 33.5);
  doc.text(`Rs. ${booking.billing.balanceDue.toFixed(2)}`, 192, y + 33.5, { align: 'right' });

  // Left terms / notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('HOTEL POLICIES & TERMS', 14, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('• Standard Check-In is at 14:00 hrs & Check-Out is at 11:00 hrs.', 14, y + 12);
  doc.text('• All rooms are strictly non-smoking. Valuables must be stored in room safe.', 14, y + 17);
  doc.text('• Government issued photo ID mandatory for all guests upon arrival.', 14, y + 22);
  doc.text('• Settlement accepted via Corporate Card, UPI, or Cash at Front Desk.', 14, y + 27);

  y += 48;

  // Signatures
  doc.setDrawColor(148, 163, 184);
  doc.line(14, y + 14, 60, y + 14);
  doc.line(140, y + 14, 196, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Guest Signature', 37, y + 18, { align: 'center' });
  doc.text('Authorized Front Desk Representative', 168, y + 18, { align: 'center' });

  // Footer Bottom Bar
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 280, 196, 280);
  doc.setFontSize(7);
  doc.text(`System Generated Invoice • Folio INV-${booking.bookingId} • Generated on ${new Date().toLocaleString()}`, 105, 284, { align: 'center' });

  // Save PDF
  doc.save(`Grand_Horizon_Invoice_${booking.bookingId}.pdf`);
}

/**
 * Triggers printing using a hidden <iframe>, or opens in a printable popup if iframe is restricted.
 */
export function printInvoiceDocument(booking: Booking): { success: boolean; method: string } {
  const htmlContent = generateInvoiceHTML(booking);

  try {
    // Strategy 1: Hidden iframe print (isolated document without UI clutter)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('title', 'Print Frame');

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 60000);
        } catch (printErr) {
          console.warn('Iframe print failed, falling back to window.open', printErr);
          fallbackPrintWindow(htmlContent);
        }
      }, 350);

      return { success: true, method: 'iframe' };
    }
  } catch (err) {
    console.warn('Hidden iframe print error, using fallback:', err);
  }

  // Strategy 2: Popup window fallback
  return fallbackPrintWindow(htmlContent);
}

function fallbackPrintWindow(htmlContent: string): { success: boolean; method: string } {
  try {
    const printWindow = window.open('', '_blank', 'width=840,height=900');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (_) {}
      }, 500);
      return { success: true, method: 'window' };
    }
  } catch (e) {
    console.warn('window.open blocked, falling back to blob download', e);
  }

  // Strategy 3: Direct HTML download fallback if all popups are sandboxed
  downloadInvoiceHTMLFile(htmlContent, 'Invoice.html');
  return { success: true, method: 'download' };
}

/**
 * Downloads the HTML invoice file
 */
export function downloadInvoiceHTML(booking: Booking): void {
  const htmlContent = generateInvoiceHTML(booking);
  downloadInvoiceHTMLFile(htmlContent, `Grand_Horizon_Invoice_${booking.bookingId}.html`);
}

function downloadInvoiceHTMLFile(htmlContent: string, filename: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an ASCII formatted receipt for clipboard or thermal printer export.
 */
export function generateInvoicePlainText(booking: Booking): string {
  const roomConfig = ROOM_TYPE_CONFIGS[booking.roomType];
  const divider = '='.repeat(48);
  const singleDivider = '-'.repeat(48);

  return [
    divider,
    '           GRAND HORIZON HOTEL & RESORT         ',
    '       100 Horizon Blvd • Ph: +1 800-555-0199   ',
    '             TAX INVOICE / FOLIO RECEIPT        ',
    divider,
    `Invoice No  : INV-${booking.bookingId}`,
    `Status      : ${booking.status}`,
    `Date Issued : ${new Date().toLocaleString()}`,
    singleDivider,
    'GUEST INFORMATION:',
    `  Name      : ${booking.guest.name}`,
    `  Phone     : ${booking.guest.phone || 'N/A'}`,
    `  Email     : ${booking.guest.email || 'N/A'}`,
    `  ID Proof  : ${booking.guest.idType || 'ID'} - ${booking.guest.idNumber || 'N/A'}`,
    `  Guests    : ${booking.guest.numberOfGuests || 1}`,
    singleDivider,
    'STAY DETAILS:',
    `  Room No   : Room #${booking.roomNumber} (${roomConfig?.name || booking.roomType})`,
    `  Check-In  : ${booking.checkInDate}`,
    `  Check-Out : ${booking.checkOutDate}`,
    `  Nights    : ${booking.nights} night(s)`,
    singleDivider,
    'ITEMIZED CHARGES:',
    `  Accommodation (${booking.nights} nts @ Rs.${booking.billing.nightlyRate.toFixed(2)}) : Rs. ${booking.billing.roomCharges.toFixed(2)}`,
    booking.billing.extraCharges > 0
      ? `  Incidentals / Room Service : Rs. ${booking.billing.extraCharges.toFixed(2)}`
      : null,
    booking.billing.discountAmount > 0
      ? `  Discount                   : -Rs. ${booking.billing.discountAmount.toFixed(2)}`
      : null,
    `  GST (${booking.billing.taxRatePercent || 10}%)               : Rs. ${booking.billing.taxAmount.toFixed(2)}`,
    singleDivider,
    `  TOTAL AMOUNT               : Rs. ${booking.billing.totalAmount.toFixed(2)}`,
    `  DEPOSIT PAID               : Rs. ${booking.billing.depositPaid.toFixed(2)}`,
    `  NET BALANCE DUE            : Rs. ${booking.billing.balanceDue.toFixed(2)}`,
    divider,
    booking.status === 'CANCELLED' && booking.cancellationReason
      ? `CANCELLED: ${booking.cancellationReason}\n${divider}`
      : null,
    '     Thank you for staying at Grand Horizon!    ',
    divider,
  ]
    .filter((line) => line !== null)
    .join('\n');
}
