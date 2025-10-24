import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CreateReviewDto, UpdateReviewDto, QueryReviewsDto } from './dto';
import { Review } from '@prisma/client';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async create(
    @Req() req: any,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const { tenantId, user } = req;
    return this.reviewsService.create(tenantId, user.id, createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all reviews' })
  @ApiResponse({ status: 200, description: 'Returns list of reviews' })
  async findAll(
    @Req() req: any,
    @Query() query: QueryReviewsDto,
  ): Promise<any> {
    const tenantId = req.tenantId;
    return this.reviewsService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Returns review details' })
  async findOne(@Req() req: any, @Param('id') id: string): Promise<Review> {
    const tenantId = req.tenantId;
    return this.reviewsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const { tenantId, user } = req;
    return this.reviewsService.update(tenantId, id, user.id, updateReviewDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  async remove(@Req() req: any, @Param('id') id: string): Promise<void> {
    const { tenantId, user } = req;
    return this.reviewsService.remove(tenantId, id, user.id);
  }
}

