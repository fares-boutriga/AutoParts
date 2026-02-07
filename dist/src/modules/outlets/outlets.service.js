"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutletsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let OutletsService = class OutletsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createOutletDto) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Outlet not found');
        }
        return outlet;
    }
    async update(id, updateOutletDto) {
        try {
            return await this.prisma.outlet.update({
                where: { id },
                data: updateOutletDto,
            });
        }
        catch (error) {
            throw new common_1.NotFoundException('Outlet not found');
        }
    }
    async remove(id) {
        try {
            await this.prisma.outlet.delete({
                where: { id },
            });
            return { message: 'Outlet deleted successfully' };
        }
        catch (error) {
            throw new common_1.NotFoundException('Outlet not found');
        }
    }
};
exports.OutletsService = OutletsService;
exports.OutletsService = OutletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OutletsService);
//# sourceMappingURL=outlets.service.js.map