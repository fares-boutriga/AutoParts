import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class InitTelegramConnectDto {
    @ApiProperty({
        description: 'Telegram connection target type',
        example: 'group',
        enum: ['group', 'private'],
    })
    @IsIn(['group', 'private'])
    targetType!: 'group' | 'private';
}
