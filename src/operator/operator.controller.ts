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
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { Operator } from './entities/operator.entity';
import { OperatorService } from './operator.service';

@ApiTags('Operators')
@Controller('operators')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @ApiCreatedResponse({ type: Operator })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Post()
  async create(@Body() payload: CreateOperatorDto): Promise<Operator> {
    return await this.operatorService.create(payload);
  }

  @ApiOkResponse({ type: Operator })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get()
  async findAll(@Body() intercept: InterceptDto): Promise<Operator[]> {
    return await this.operatorService.findAll(intercept);
  }

  @ApiOkResponse({ type: Operator, isArray: true })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Body() intercept: InterceptDto,
  ): Promise<Operator> {
    return await this.operatorService.findOne(id, intercept);
  }

  @ApiOkResponse({ type: 'string' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateOperatorDto,
  ): Promise<string> {
    return await this.operatorService.update(id, payload);
  }

  @ApiOkResponse({ type: 'string' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() intercept: InterceptDto,
  ): Promise<string> {
    return await this.operatorService.remove(id, intercept);
  }
}
