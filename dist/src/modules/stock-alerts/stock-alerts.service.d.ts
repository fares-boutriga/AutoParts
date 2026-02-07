import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
export declare class StockAlertsService {
    private prisma;
    private emailService;
    private configService;
    constructor(prisma: PrismaService, emailService: EmailService, configService: ConfigService);
    checkStockLevels(): Promise<void>;
    checkStockAfterUpdate(stockId: string): Promise<void>;
    private createStockAlert;
}
