import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { KafkaService } from 'src/messaging/kafka.service';

interface CreatePurchaseParams {
  customerId: string;
  productId: string;
}

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService, private kafka: KafkaService) {}

  listAllPurchases() {
    return this.prisma.purchase.findMany({ orderBy: { createdAt: 'desc' } });
  }

  listAllPurchasesFromCustomerId(customerId: string) {
    return this.prisma.purchase.findMany({
      where: { customerId },
    });
  }

  async createPurchase({ customerId, productId }: CreatePurchaseParams) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const purchase = await this.prisma.purchase.create({
      data: { customerId, productId },
    });

    const { authUserId } = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    this.kafka.emit('purchases.new-purchase', {
      customer: {
        authUserId,
      },
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
      },
    });

    return purchase;
  }
}
