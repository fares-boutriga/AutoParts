import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateCustomerDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false, description: 'Vehicle plate number' })
    @IsOptional()
    @IsString()
    carPlate?: string;

    @ApiProperty({ required: false, description: 'Vehicle VIN number' })
    @IsOptional()
    @IsString()
    vin?: string;
}
