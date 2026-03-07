import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService.findByReference', () => {
    let service: ProductsService;
    let prisma: any;

    beforeEach(() => {
        prisma = {
            product: {
                findFirst: jest.fn(),
            },
        };
        service = new ProductsService(prisma);
    });

    it('returns a mapped product when reference exists (case-insensitive)', async () => {
        prisma.product.findFirst.mockResolvedValue({
            id: 'p1',
            name: 'Brake Pad',
            reference: 'BP-001',
            sellingPrice: 20,
            stocks: [{ quantity: 3 }, { quantity: 7 }],
        });

        const result = await service.findByReference('bp-001');

        expect(prisma.product.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    reference: {
                        equals: 'bp-001',
                        mode: 'insensitive',
                    },
                },
            }),
        );
        expect(result.totalQuantity).toBe(10);
        expect(result.isStocked).toBe(true);
        expect(result.reference).toBe('BP-001');
    });

    it('throws NotFoundException when reference does not exist', async () => {
        prisma.product.findFirst.mockResolvedValue(null);
        await expect(service.findByReference('unknown')).rejects.toThrow(NotFoundException);
    });
});
