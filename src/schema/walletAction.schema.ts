// webhook-payload.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface TransactionActivity {
  fromAddress: string;
  toAddress: string;
  blockNum: string;
  hash: string;
  value: number;
  asset: string;
  category: string;
  rawContract: {
    rawValue: string;
    decimals: number;
  };
}

@Schema({ timestamps: true, collection: 'wallet_events' })
export class wallet_events extends Document {

  @Prop()
  email: string;

  @Prop()
  webhookId: string;

  @Prop()
  id: string;

  @Prop()
  createdAt: Date;

  @Prop()
  type: string;

  @Prop({
    type: {
      network: String,
      activity: [{
        fromAddress: String,
        toAddress: String,
        blockNum: String,
        hash: String,
        value: Number,
        asset: String,
        category: String,
        rawContract: {
          rawValue: String,
          decimals: Number,
        },
      }],
    },
  })
  event: {
    network: string;
    activity: TransactionActivity[];
  };

  @Prop({ unique: true })
  walletAddress: string;

  @Prop()
  events: any[];
}
export type WebhookPayloadDocument = wallet_events & Document;

export const WebhookPayloadSchema = SchemaFactory.createForClass(wallet_events);
