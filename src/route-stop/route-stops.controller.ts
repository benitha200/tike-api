import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RouteStopsService } from './route-stops.service';

@Controller('route-stops')
export class RouteStopsController {
  constructor(private readonly routeStopsService: RouteStopsService) {}

  @Post()
  async create(@Body() createRouteStopDto: { routeId: number; stopId: number; stopOrder: number; duration: number }) {
    return await this.routeStopsService.create(createRouteStopDto);
  }

  @Get('route/:routeId')
  async findByRoute(@Param('routeId') routeId: number) {
    return await this.routeStopsService.findByRoute(routeId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.routeStopsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateRouteStopDto: { stopId?: number; stopOrder?: number; duration?: number }) {
    return await this.routeStopsService.update(id, updateRouteStopDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.routeStopsService.remove(id);
  }
}
