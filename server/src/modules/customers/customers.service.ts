import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async create(createCustomerDto: CreateCustomerDto) {
        return this.prisma.customer.create({
            data: createCustomerDto,
        });
    }

    async findAll(filters?: { search?: string; page?: number; limit?: number }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where = filters?.search
            ? {
                OR: [
                    { name: { contains: filters.search, mode: 'insensitive' as const } },
                    { email: { contains: filters.search, mode: 'insensitive' as const } },
                    { phone: { contains: filters.search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [rawCustomers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take: limit,
                include: {
                    _count: { select: { orders: true } },
                    orders: {
                        select: { totalAmount: true, createdAt: true },
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            }),
            this.prisma.customer.count({ where }),
        ]);

        const data = rawCustomers.map(({ _count, orders, ...customer }) => ({
            ...customer,
            orderCount: _count.orders,
            lastOrderAt: orders[0]?.createdAt ?? null,
        }));

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        items: {
                            include: { product: { select: { name: true, reference: true } } },
                        },
                    },
                },
            },
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        return customer;
    }

    async update(id: string, updateCustomerDto: UpdateCustomerDto) {
        try {
            return await this.prisma.customer.update({
                where: { id },
                data: updateCustomerDto,
            });
        } catch (error) {
            throw new NotFoundException('Customer not found');
        }
    }

    async remove(id: string) {
        try {
            await this.prisma.customer.delete({
                where: { id },
            });
            return { message: 'Customer deleted successfully' };
        } catch (error) {
            throw new NotFoundException('Customer not found');
        }
    }
}
