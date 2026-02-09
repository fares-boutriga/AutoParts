import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, ValidateIf } from 'class-validator';

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
}
