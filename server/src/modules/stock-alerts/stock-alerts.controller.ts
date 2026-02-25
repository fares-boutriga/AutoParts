import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Stock Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('stock/alerts')
export class StockAlertsController {
    constructor(private prisma: PrismaService) { }

    @Get()
    @RequirePermissions('view_notifications')
    @ApiOperation({ summary: 'Get all stock alerts' })
    async findAll() {
        const notifications = await this.prisma.notification.findMany({
            where: {
                type: 'STOCK_ALERT',
            },
            include: {
                product: {
                    select: {
                        name: true,
                        reference: true,
                        stocks: {
                            select: {
                                quantity: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const alerts = notifications.map((n) => {
            return {
                id: n.id,
                productId: n.productId,
                productName: n.product?.name || 'Unknown Product',
                reference: n.product?.reference || 'N/A',
                // Since we don't store the exact snapshot in the notification record fields easily (without data JSON),
                // we'll use the current quantity or a placeholder.
                // In a real system, the notification message or a 'data' JSON field would hold this.
                currentStock: n.product?.stocks?.[0]?.quantity || 0,
                minStockLevel: 0, // This should also ideally be in the notification data
                status: n.seen ? 'ACKNOWLEDGED' : 'PENDING',
                message: n.message,
                createdAt: n.createdAt,
            };
        });

        return {
            data: alerts,
            meta: {
                total: alerts.length,
            },
        };
    }

    @Patch(':id/acknowledge')
    @RequirePermissions('view_notifications')
    @ApiOperation({ summary: 'Acknowledge a stock alert' })
    async acknowledge(@Param('id') id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { seen: true },
        });
    }
}
