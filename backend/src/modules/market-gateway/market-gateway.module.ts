/**
 * Market Gateway Module
 */

import { Module } from '@nestjs/common';
import { MarketGatewayController } from './market-gateway.controller';
import { MarketGatewayService } from './market-gateway.service';
import { DefiLlamaAdapter } from './adapters/defillama.adapter';
import { ExchangeAdapter } from './adapters/exchange.adapter';

@Module({
  controllers: [MarketGatewayController],
  providers: [
    MarketGatewayService,
    DefiLlamaAdapter,
    ExchangeAdapter,
  ],
  exports: [MarketGatewayService],
})
export class MarketGatewayModule {}
