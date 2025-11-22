import { ObjectType, Field, ID, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class Document {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  fileUrl: string;

  @Field()
  fileType: string;

  @Field()
  fileSize: number;

  @Field()
  status: string;

  @Field({ nullable: true })
  analysisResult?: string;

  @Field()
  tenantId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateDocumentInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  fileUrl: string;

  @Field()
  fileType: string;

  @Field(() => Int)
  fileSize: number;
}

@InputType()
export class UpdateDocumentInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

