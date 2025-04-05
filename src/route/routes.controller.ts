import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Route } from './entities/routes.entity';  // Assuming your route entity is in this path
import { Location as Stop } from 'src/location/entities/location.entity'; // Stop entity
import { CreateRouteDto } from './dto/create-route.dto'; // Import CreateRouteDto

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  // Create a new route
  @Post()
  async create(@Body() createRouteDto: CreateRouteDto): Promise<Route> {
    return await this.routesService.create(createRouteDto);
  }

  // Get all routes
  @Get()
  async findAll(): Promise<Route[]> {
    return await this.routesService.findAll();
  }

  // Get a single route by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Route> {
    return await this.routesService.findOne(id);
  }

  // Update a route by ID
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRouteDto: { name?: string; originStop?: Stop; terminalStop?: Stop },
  ): Promise<string> {
    return await this.routesService.update(id, updateRouteDto);
  }

  // Delete a route by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<string> {
    return await this.routesService.remove(id);
  }
}
