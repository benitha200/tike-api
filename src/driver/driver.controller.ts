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
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';

@ApiTags('Drivers')
@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @ApiCreatedResponse({ type: Driver })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Post()
  async create(@Body() payload: CreateDriverDto): Promise<Driver> {
    return await this.driverService.create(payload);
  }

  @ApiOkResponse({ type: Driver, isArray: true })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get()
  async findAll(@Body() intercept: InterceptDto): Promise<Driver[]> {
    return await this.driverService.findAll(intercept);
  }

  @ApiOkResponse({ type: Driver })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Body() intercept: InterceptDto,
  ): Promise<Driver> {
    return await this.driverService.findOne(id, intercept);
  }

  @ApiOkResponse({ type: 'string' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateDriverDto,
  ): Promise<string> {
    return await this.driverService.update(id, payload);
  }

  @ApiOkResponse({ type: 'string' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() intercept: InterceptDto,
  ): Promise<string> {
    return await this.driverService.remove(id, intercept);
  }
}
