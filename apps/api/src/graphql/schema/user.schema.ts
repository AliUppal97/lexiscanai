import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  isActive: boolean;

  @Field()
  isEmailVerified: boolean;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field()
  tenantId: string;

  @Field(() => Organization, { nullable: true })
  tenant?: Organization;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  phone?: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType()
export class Organization {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  domain?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field()
  isActive: boolean;

  @Field(() => [User], { nullable: true })
  users?: User[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateOrganizationInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  domain?: string;
}

@InputType()
export class UpdateOrganizationInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  domain?: string;

  @Field({ nullable: true })
  logo?: string;
}

