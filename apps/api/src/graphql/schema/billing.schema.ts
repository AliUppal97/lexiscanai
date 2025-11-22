import { ObjectType, Field, ID, InputType, Float } from '@nestjs/graphql';

@ObjectType()
export class Billing {
  @Field(() => ID)
  id: string;

  @Field()
  tenantId: string;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  invoiceUrl?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateBillingInput {
  @Field(() => Float)
  amount: number;

  @Field({ nullable: true })
  currency?: string;
}

@ObjectType()
export class BillingSubscriptionPayload {
  @Field()
  mutation: string;

  @Field(() => Billing)
  data: Billing;
}

