import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Route } from './entities/routes.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto }  from './dto/update-route.dto';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  // Create a new route with stops
  @Post()
  async create(@Body() createRouteDto: CreateRouteDto): Promise<Route> {
    return await this.routesService.create(createRouteDto);
  }

  // Get all routes with stops
  @Get()
  async findAll(): Promise<Route[]> {
    return await this.routesService.findAll();
  }

  // Get one route by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Route> {
    return await this.routesService.findOne(id);
  }

  // Update route and stops
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ): Promise<string> {
    return await this.routesService.update(id, updateRouteDto);
  }

  // Delete route and its associated stops
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<string> {
    return await this.routesService.remove(id);
  }
}
