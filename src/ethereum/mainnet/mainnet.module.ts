import { Module } from '@nestjs/common';
import { MainnetController } from './mainnet.controller';
import { MainnetService } from './mainnet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletBalance, walletBalanceSchema } from 'src/schema/WalletBalance.schema';
import { WebhookController } from './webhooks/webhook.controller';
import { wallet_events, WebhookPayloadSchema } from 'src/schema/walletAction.schema';
import { EventsGateway } from '../websocket/events/events.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{name: WalletBalance.name, schema:walletBalanceSchema},
      { name: wallet_events.name, schema: WebhookPayloadSchema }])
  ],
  controllers: [MainnetController,WebhookController],
  providers: [MainnetService,EventsGateway]
}) 
export class MainnetModule {} 
