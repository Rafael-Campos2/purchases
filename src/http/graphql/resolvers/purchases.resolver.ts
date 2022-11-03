import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthorizationGuard } from 'src/http/auth/authorization.guard';
import { AuthUser, CurrentUser } from 'src/http/auth/current-user';
import { CustomersService } from 'src/services/customers.service';
import { ProductsService } from 'src/services/products.service';
import { PurchasesService } from 'src/services/purchases.service';
import { CreatePurchaseInput } from '../inputs/create-purchase-input';
import { Product } from '../models/product';
import { Purchase } from '../models/purchases';

@Resolver(() => Purchase)
export class PurchasesResolver {
  constructor(
    private purchasesService: PurchasesService,
    private productsService: ProductsService,
    private customersService: CustomersService,
  ) {}

  @Query(() => [Purchase])
  @UseGuards(AuthorizationGuard)
  purchases() {
    return this.purchasesService.listAllPurchases();
  }

  @ResolveField(() => Product)
  product(
    @Parent()
    purchase: Purchase,
  ) {
    return this.productsService.findProductById(purchase.productId);
  }

  @UseGuards(AuthorizationGuard)
  @Mutation(() => Purchase)
  async createPurchase(
    @Args('data') data: CreatePurchaseInput,
    @CurrentUser() authUser: AuthUser,
  ) {
    let customer = await this.customersService.getCustomerByAuthUserId(
      authUser.sub,
    );

    if (!customer) {
      customer = await this.customersService.createCustomer({
        authUserId: authUser.sub,
      });
    }

    return this.purchasesService.createPurchase({
      customerId: customer.id,
      productId: data.productId,
    });
  }
}
