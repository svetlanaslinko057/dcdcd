import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { CommonModule } from './common/common.module';
import { IntelModule } from './modules/intel/intel.module';
import { NewsModule } from './modules/news/news.module';
import { KnowledgeGraphModule } from './modules/knowledge-graph/knowledge-graph.module';
import { SentimentModule } from './modules/sentiment/sentiment.module';
import { MarketGatewayModule } from './modules/market-gateway/market-gateway.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL') || 'mongodb://localhost:27017',
        dbName: configService.get<string>('DB_NAME') || 'fomo_market',
      }),
      inject: [ConfigService],
    }),
    
    // Scheduler
    ScheduleModule.forRoot(),
    
    // Common module (Browser service)
    CommonModule,
    
    // Feature modules
    IntelModule,
    NewsModule,
    KnowledgeGraphModule,
    SentimentModule,
    MarketGatewayModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
