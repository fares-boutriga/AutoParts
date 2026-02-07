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

    async findAll() {
        return this.prisma.customer.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { orders: true },
        });
        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }

    async update(id: string, updateCustomerDto: UpdateCustomerDto) {
        try {
            return await this.prisma.customer.update({
                where: { id },
                data: updateCustomerDto,
            });
        } catch {
            throw new NotFoundException('Customer not found');
        }
    }

    async remove(id: string) {
        try {
            return await this.prisma.customer.delete({
                where: { id },
            });
        } catch {
            throw new NotFoundException('Customer not found');
        }
    }
}
