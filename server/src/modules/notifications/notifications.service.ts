import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async findAll(outletId?: string) {
        const where: any = {};
        if (outletId) where.outletId = outletId;

        return this.prisma.notification.findMany({
            where,
            include: {
                product: { select: { id: true, name: true } },
                outlet: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markAsSeen(id: string) {
        try {
            return await this.prisma.notification.update({
                where: { id },
                data: { seen: true },
            });
        } catch {
            throw new NotFoundException('Notification not found');
        }
    }

    async markAllAsSeen(outletId: string) {
        return this.prisma.notification.updateMany({
            where: { outletId },
            data: { seen: true },
        });
    }

    async remove(id: string) {
        try {
            return await this.prisma.notification.delete({
                where: { id },
            });
        } catch {
            throw new NotFoundException('Notification not found');
        }
    }
}
