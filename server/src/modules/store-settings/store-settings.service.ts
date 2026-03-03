import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreSettingsDto } from './dto/create-store-settings.dto';

@Injectable()
export class StoreSettingsService {
    constructor(private prisma: PrismaService) { }

    async getOrCreate() {
        const existing = await this.prisma.storeSettings.findFirst();
        if (existing) return existing;

        return this.prisma.storeSettings.create({ data: {} });
    }

    async update(dto: CreateStoreSettingsDto) {
        let settings = await this.prisma.storeSettings.findFirst();

        if (!settings) {
            return this.prisma.storeSettings.create({ data: dto });
        }

        return this.prisma.storeSettings.update({
            where: { id: settings.id },
            data: dto,
        });
    }
}
