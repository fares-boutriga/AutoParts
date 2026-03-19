import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignOutletsDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    outletIds: string[];
}
