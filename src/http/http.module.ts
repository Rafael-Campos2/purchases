import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import path from 'node:path';

import { DatabaseModule } from 'src/database/database.module';
import { ProductsResolver } from './graphql/resolvers/products.resolver';
import { ProductsService } from 'src/services/products.service';
import { PurchasesResolver } from './graphql/resolvers/purchases.resolver';
import { PurchasesService } from 'src/services/purchases.service';
import { CustomersService } from 'src/services/customers.service';
import { CustomersResolver } from './graphql/resolvers/customers.resolver';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: path.resolve(process.cwd(), 'src/schema.gql'),
    }),
  ],
  providers: [
    //Resolvers
    ProductsResolver,
    PurchasesResolver,
    CustomersResolver,

    //Services
    ProductsService,
    PurchasesService,
    CustomersService,
  ],
})
export class HttpModule {}
