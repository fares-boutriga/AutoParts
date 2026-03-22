import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateOutletAlertsDto } from './update-outlet-alerts.dto';

describe('UpdateOutletAlertsDto', () => {
    it('accepts valid Telegram group chat ID when Telegram alerts are enabled', async () => {
        const dto = plainToInstance(UpdateOutletAlertsDto, {
            alertsEnabled: true,
            alertEmail: 'admin@outlet.com',
            telegramAlertsEnabled: true,
            telegramChatId: '-1001234567890',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('rejects invalid Telegram chat ID format when Telegram alerts are enabled', async () => {
        const dto = plainToInstance(UpdateOutletAlertsDto, {
            alertsEnabled: true,
            alertEmail: 'admin@outlet.com',
            telegramAlertsEnabled: true,
            telegramChatId: '+21612345678',
        });

        const errors = await validate(dto);
        expect(errors.some((error) => error.property === 'telegramChatId')).toBe(true);
    });

    it('allows enabling Telegram alerts without chat ID (connection handled separately)', async () => {
        const dto = plainToInstance(UpdateOutletAlertsDto, {
            alertsEnabled: true,
            alertEmail: 'admin@outlet.com',
            telegramAlertsEnabled: true,
        });

        const errors = await validate(dto);
        expect(errors.some((error) => error.property === 'telegramChatId')).toBe(false);
    });
});
