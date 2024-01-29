import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true, collection: 'wallet_balance' })
export class WalletBalance {

    @Prop({ unique: true })
    walletAddress: string;

    @Prop([{
        symbol: String,
        name: String,
        address: String,
        decimals: Number,
        chainId: Number,
        logoURI: String,
    }])
    tokens: Array<{
        symbol: string;
        name: string;
        address: string;
        decimals: number;
        chainId: number;
        logoURI: string;
    }>;

}

export const walletBalanceSchema = SchemaFactory.createForClass(WalletBalance)