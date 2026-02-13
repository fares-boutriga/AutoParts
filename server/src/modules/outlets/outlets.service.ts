import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';

@Injectable()
export class OutletsService {
    constructor(private prisma: PrismaService) { }

    async create(createOutletDto: CreateOutletDto) {
        return this.prisma.outlet.create({
            data: createOutletDto,
        });
    }

    async findAll() {
        return this.prisma.outlet.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        stocks: true,
                        orders: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const outlet = await this.prisma.outlet.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        stocks: true,
                        orders: true,
                        notifications: true,
                    },
                },
            },
        });

        if (!outlet) {
            throw new NotFoundException('Outlet not found');
        }

        return outlet;
    }

    async update(id: string, updateOutletDto: UpdateOutletDto) {
        try {
            return await this.prisma.outlet.update({
                where: { id },
                data: updateOutletDto,
            });
        } catch (error) {
            throw new NotFoundException('Outlet not found');
        }
    }

    async updateAlertSettings(id: string, updateAlertsDto: { alertsEnabled: boolean; alertEmail?: string }) {
        try {
            return await this.prisma.outlet.update({
                where: { id },
                data: {
                    alertsEnabled: updateAlertsDto.alertsEnabled,
                    email: updateAlertsDto.alertEmail,
                },
            });
        } catch (error) {
            throw new NotFoundException('Outlet not found');
        }
    }

    async remove(id: string) {
        try {
            await this.prisma.outlet.delete({
                where: { id },
            });
            return { message: 'Outlet deleted successfully' };
        } catch (error) {
            throw new NotFoundException('Outlet not found');
        }
    }
}
