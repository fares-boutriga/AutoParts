import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: this.configService.get<boolean>('SMTP_SECURE') === true,
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASSWORD'),
            },
        });
    }

    async sendStockAlert(
        recipientEmail: string,
        productName: string,
        currentQuantity: number,
        minStockLevel: number,
        outletName: string,
    ) {
        try {
            const mailOptions = {
                from: this.configService.get<string>('EMAIL_FROM'),
                to: recipientEmail,
                subject: `🚨 Stock Alert: ${productName} - Low Inventory`,
                html: this.getStockAlertTemplate(
                    productName,
                    currentQuantity,
                    minStockLevel,
                    outletName,
                ),
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            return { success: false, error: error.message };
        }
    }

    private getStockAlertTemplate(
        productName: string,
        currentQuantity: number,
        minStockLevel: number,
        outletName: string,
    ): string {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .alert-box { background: #fff; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Stock Alert</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2 style="margin-top: 0; color: #dc3545;">Low Stock Warning</h2>
              <p>The following product has fallen below the minimum stock threshold:</p>
            </div>
            
            <div class="details">
              <div class="details-row">
                <span class="label">Product:</span>
                <span class="value"><strong>${productName}</strong></span>
              </div>
              <div class="details-row">
                <span class="label">Outlet:</span>
                <span class="value">${outletName}</span>
              </div>
              <div class="details-row">
                <span class="label">Current Quantity:</span>
                <span class="value" style="color: #dc3545; font-weight: bold;">${currentQuantity}</span>
              </div>
              <div class="details-row">
                <span class="label">Minimum Stock Level:</span>
                <span class="value">${minStockLevel}</span>
              </div>
            </div>
            
            <p style="margin-top: 20px;">
              <strong>Action Required:</strong> Please restock this product as soon as possible to avoid stockouts.
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from Auto Parts POS System</p>
            <p>© ${new Date().getFullYear()} Auto Parts POS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
}
