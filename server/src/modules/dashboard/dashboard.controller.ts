import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('summary')
    @ApiOperation({ summary: 'Get dashboard KPI summary and recent sales' })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: ['today', '7d', 'month'],
    })
    @ApiQuery({
        name: 'outletId',
        required: false,
        type: String,
    })
    getSummary(@CurrentUser() user: any, @Query() query: DashboardQueryDto) {
        return this.dashboardService.getSummary(user, query);
    }
}
