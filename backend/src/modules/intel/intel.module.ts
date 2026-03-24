import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../../common/common.module';
import { IntelController } from './intel.controller';
import { DropstabModule } from './dropstab/dropstab.module';
import { CryptoRankModule } from './cryptorank/cryptorank.module';
import { IcoDropsScraperService } from './icodrops/icodrops-scraper.service';
import { IcoDropsSyncService } from './icodrops/icodrops-sync.service';
import { IcoDropsController } from './icodrops/icodrops.controller';
import {
  ProjectSchema,
  InvestorSchema,
  UnlockSchema,
  FundraisingSchema,
  CategorySchema,
  ActivitySchema,
  FundSchema,
  PersonSchema,
} from './schemas/intel.schemas';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      { name: 'intel_projects', schema: ProjectSchema },
      { name: 'intel_investors', schema: InvestorSchema },
      { name: 'intel_unlocks', schema: UnlockSchema },
      { name: 'intel_fundraising', schema: FundraisingSchema },
      { name: 'intel_categories', schema: CategorySchema },
      { name: 'intel_activity', schema: ActivitySchema },
      { name: 'intel_funds', schema: FundSchema },
      { name: 'intel_persons', schema: PersonSchema },
      { name: 'intel_launchpads', schema: {} },
      { name: 'intel_market', schema: {} },
      { name: 'intel_icos', schema: {} },
    ]),
    DropstabModule,
    CryptoRankModule,
  ],
  controllers: [IntelController, IcoDropsController],
  providers: [IcoDropsScraperService, IcoDropsSyncService],
})
export class IntelModule {}
