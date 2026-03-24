/**
 * Market Gateway Controller
 */

import { Controller, Get, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { MarketGatewayService } from './market-gateway.service';

@Controller('market')
export class MarketGatewayController {
  constructor(private readonly gateway: MarketGatewayService) {}

  // Quote endpoints
  @Get('quote')
  async getQuote(@Query('asset') asset: string) {
    if (!asset) {
      throw new HttpException('Asset parameter is required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.gateway.getQuote(asset);
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('quotes')
  async getBulkQuotes(@Query('assets') assets: string) {
    if (!assets) {
      throw new HttpException('Assets parameter is required', HttpStatus.BAD_REQUEST);
    }
    try {
      const assetList = assets.split(',').map(a => a.trim());
      return await this.gateway.getBulkQuotes(assetList);
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Market overview
  @Get('overview')
  async getOverview() {
    try {
      return await this.gateway.getOverview();
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Candles
  @Get('candles')
  async getCandles(
    @Query('asset') asset: string,
    @Query('interval') interval: string = '1h',
    @Query('limit') limit: string = '100',
  ) {
    if (!asset) {
      throw new HttpException('Asset parameter is required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.gateway.getCandles(asset, interval, parseInt(limit, 10));
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Exchange data
  @Get('exchanges/:asset')
  async getExchanges(@Param('asset') asset: string) {
    try {
      return await this.gateway.getExchanges(asset);
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('orderbook/:asset')
  async getOrderbook(
    @Param('asset') asset: string,
    @Query('exchange') exchange: string = 'binance',
    @Query('limit') limit: string = '20',
  ) {
    try {
      return await this.gateway.getOrderbook(asset, exchange, parseInt(limit, 10));
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('trades/:asset')
  async getTrades(
    @Param('asset') asset: string,
    @Query('exchange') exchange: string = 'binance',
    @Query('limit') limit: string = '50',
  ) {
    try {
      return await this.gateway.getTrades(asset, exchange, parseInt(limit, 10));
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Health & Status
  @Get('providers/health')
  async getProvidersHealth() {
    try {
      return await this.gateway.getProvidersHealth();
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('cache/stats')
  async getCacheStats() {
    return this.gateway.getCacheStats();
  }
}
