import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RouteStopsService } from './route-stops.service';

@Controller('route-stops')
export class RouteStopsController {
  constructor(private readonly routeStopsService: RouteStopsService) {}

  // Create Route Stop - using stopName and price instead of stopId
  @Post()
  async create(@Body() createRouteStopDto: { routeId: string; stopName: string; stopOrder: number; duration: number; price: number }) {
    return await this.routeStopsService.create(createRouteStopDto);
  }

  // Find all Route Stops for a given Route
  @Get('route/:routeId')
  async findByRoute(@Param('routeId') routeId: string) {
    return await this.routeStopsService.findByRoute(routeId);
  }

  // Find a specific Route Stop by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.routeStopsService.findOne(id);
  }

  // Update a Route Stop
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRouteStopDto: { stopName?: string; stopOrder?: number; duration?: number; price?: number }) {
    return await this.routeStopsService.update(id, updateRouteStopDto);
  }

  // Delete a Route Stop
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.routeStopsService.remove(id);
  }
}
