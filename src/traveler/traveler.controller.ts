import { Body, Controller, Delete, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { Traveler } from './entities/traveler.entity';
import { TravelerService } from './traveler.service';

@ApiTags('Travelers')
@Controller('travelers')
export class TravelerController {
  constructor(private readonly travelerService: TravelerService) {}

  @ApiOkResponse({ type: Traveler, isArray: true })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get()
  async findAll(@Body() intercept: InterceptDto): Promise<Traveler[]> {
    return await this.travelerService.findAll(intercept);
  }

  @ApiOkResponse({ type: Traveler })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Body() intercept: InterceptDto,
  ): Promise<Traveler> {
    return await this.travelerService.findOne(id, intercept);
  }

  @ApiOkResponse({ type: 'string' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() intercept: InterceptDto,
  ): Promise<string> {
    return await this.travelerService.remove(id, intercept);
  }
}
