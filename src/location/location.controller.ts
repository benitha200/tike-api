import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Location } from 'src/location/entities/location.entity';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationService } from './location.service';
import { Public } from 'src/auth/utils/local-auth.decorator';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiCreatedResponse({ type: Location })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Post()
  async create(@Body() payload: CreateLocationDto): Promise<Location> {
    return this.locationService.create(payload);
  }

  @Public()
  @ApiOkResponse({ type: Location, isArray: true })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get()
  async findAll(@Body() intercept: InterceptDto): Promise<Location[]> {
    return this.locationService.findAll(intercept);
  }

  @ApiOkResponse({ type: Location })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Body() intercept: InterceptDto,
  ): Promise<Location> {
    return this.locationService.findOne(id, intercept);
  }

  @ApiOkResponse({ type: 'string' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateLocationDto,
  ): Promise<string> {
    return this.locationService.update(id, payload);
  }

  @ApiOkResponse({ type: 'string' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() intercept: InterceptDto,
  ): Promise<string> {
    return this.locationService.remove(id, intercept);
  }
}