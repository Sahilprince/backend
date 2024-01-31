// webhook.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MainnetService } from '../mainnet.service';

@Controller('webhook')
export class WebhookController {
    constructor(private readonly mainnetService: MainnetService) { }

    @Post('/:address')
    async handleWebhook(@Body() payload: any, @Param('address')  address: string) {
        console.log('Received webhook event:', payload);
        const result = await this.mainnetService.processWebhook(payload,address);

        return { success: true, result };
    }
   
}
