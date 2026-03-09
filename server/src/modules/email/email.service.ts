import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const portRaw = this.configService.get<string>('SMTP_PORT');
    const secureRaw = this.configService.get<string>('SMTP_SECURE');
    const port = Number(portRaw || 587);
    const secure = this.parseBoolean(secureRaw, port === 465);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    this.logger.log(`SMTP configured: host=${host} port=${port} secure=${secure}`);
  }

  async onModuleInit() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error: any) {
      this.logger.error(`SMTP verify failed: ${error?.message || 'unknown error'}`);
    }
  }

  private parseBoolean(value: string | undefined, fallback: boolean) {
    if (!value) return fallback;
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    return fallback;
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
      this.logger.log(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      const message = (error as any)?.message || 'Unknown mail error';
      this.logger.error(`Failed to send email: ${message}`);
      return { success: false, error: message };
    }
  }

  async sendEmailChangeNotification(
    adminEmail: string,
    userName: string,
    oldEmail: string,
  ) {
    try {
      const now = new Date().toLocaleString('fr-TN', { timeZone: 'Africa/Tunis' });
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to: adminEmail,
        subject: `⚠️ Modification d'email - ${userName}`,
        html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                      .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                      .info-box { background: #fff; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                      .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header"><h1>⚠️ Modification d'adresse email</h1></div>
                      <div class="content">
                        <div class="info-box">
                          <p><strong>Notification système :</strong> Un utilisateur a modifié son adresse email.</p>
                        </div>
                        <p><strong>Utilisateur :</strong> ${userName}</p>
                        <p><strong>Ancienne adresse email :</strong> ${oldEmail}</p>
                        <p><strong>Date de modification :</strong> ${now}</p>
                        <p style="margin-top:20px; color:#777; font-size:13px;">
                          Pour des raisons de confidentialité, la nouvelle adresse email n'est pas affichée dans cette notification.
                          Veuillez vous connecter au panneau d'administration pour consulter les informations complètes.
                        </p>
                      </div>
                      <div class="footer">
                        <p>Système Auto Parts POS &mdash; Notification automatique</p>
                      </div>
                    </div>
                  </body>
                  </html>
                `,
      };
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email change notification sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      const message = (error as any)?.message || 'Unknown mail error';
      this.logger.error(`Failed to send email change notification: ${message}`);
      return { success: false, error: message };
    }
  }

  async sendPasswordChangeNotification(
    adminEmail: string,
    userName: string,
    userEmail: string,
  ) {
    try {
      const now = new Date().toLocaleString('fr-TN', { timeZone: 'Africa/Tunis' });
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to: adminEmail,
        subject: `Alerte securite - Changement de mot de passe (${userName})`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
              .info-box { background: #fff; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header"><h1>Alerte securite</h1></div>
              <div class="content">
                <div class="info-box">
                  <p><strong>Notification systeme :</strong> Un utilisateur a change son mot de passe.</p>
                </div>
                <p><strong>Utilisateur :</strong> ${userName}</p>
                <p><strong>Email utilisateur :</strong> ${userEmail}</p>
                <p><strong>Date de modification :</strong> ${now}</p>
                <p style="margin-top:20px; color:#777; font-size:13px;">
                  Verifiez cette action dans le panneau d'administration si ce changement n'etait pas attendu.
                </p>
              </div>
              <div class="footer">
                <p>Systeme Auto Parts POS &mdash; Notification automatique</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password change notification sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      const message = (error as any)?.message || 'Unknown mail error';
      this.logger.error(`Failed to send password change notification: ${message}`);
      return { success: false, error: message };
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
