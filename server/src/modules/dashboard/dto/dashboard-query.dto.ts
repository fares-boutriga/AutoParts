import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

export const DASHBOARD_PERIODS = ['today', '7d', 'month'] as const;
export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export class DashboardQueryDto {
    @ApiPropertyOptional({
        enum: DASHBOARD_PERIODS,
        default: 'today',
        description: 'Time period used for dashboard aggregates',
    })
    @IsOptional()
    @IsIn(DASHBOARD_PERIODS)
    period?: DashboardPeriod;

    @ApiPropertyOptional({
        description: 'Outlet ID. If omitted, first assigned user outlet is used.',
    })
    @IsOptional()
    @IsUUID()
    outletId?: string;
}
