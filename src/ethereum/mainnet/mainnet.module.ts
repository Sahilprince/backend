import { Module } from '@nestjs/common';
import { MainnetController } from './mainnet.controller';
import { MainnetService } from './mainnet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletBalance, walletBalanceSchema } from 'src/schema/WalletBalance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: WalletBalance.name, schema:walletBalanceSchema}])
  ],
  controllers: [MainnetController],
  providers: [MainnetService]
}) 
export class MainnetModule {}
