import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, Matches, ValidateIf } from 'class-validator';

export class UpdateOutletAlertsDto {
    @ApiProperty({
        description: 'Enable or disable stock alerts for this outlet',
        example: true,
    })
    @IsBoolean()
    alertsEnabled: boolean;

    @ApiProperty({
        description: 'Email address for stock alert notifications (required when alerts are enabled)',
        example: 'admin@outlet.com',
        required: false,
    })
    @ValidateIf((o) => o.alertsEnabled === true)
    @IsEmail({}, { message: 'Valid email is required when alerts are enabled' })
    alertEmail?: string;

    @ApiProperty({
        description: 'Enable or disable Telegram stock alerts for this outlet',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    telegramAlertsEnabled?: boolean;

    @ApiProperty({
        description: 'Telegram chat ID (system-managed in normal flow)',
        example: '-1001234567890',
        required: false,
    })
    @IsOptional()
    @Matches(/^-?\d+$/, {
        message: 'Valid Telegram chat ID must be a signed integer',
    })
    telegramChatId?: string;
}
