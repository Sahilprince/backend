import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { MainnetService } from './mainnet.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Wallet on Ethereum')
@Controller('api/mainnet')
export class MainnetController {
    constructor(private readonly mainnetService: MainnetService) { }


    @Get('/balance/eth/wallet/:id')
    async GetBalance(@Res() res, @Param('id') address) {
        try {
            const response = await this.mainnetService.getBalance(address)
            return res.status(200).json(response)
        } catch (error) {
            console.log("Error in getting balance", error);
            return res.status(400).send(`Server error ${error}`)
        }
    }
    @Get('/logs/:address')
    async GetLogsForOneYear(@Res() res, @Param('address') address) {
        try {
            const response = await this.mainnetService.getLast10Transactions(address)
            return res.status(200).json(response)
        } catch (error) {
            console.log("Error in getting logs", error);
            return res.status(400).send(`Server Error ${error}`)
        }
    }

    @Get('/logs/:address/:years')
    async GetLogs(@Res() res, @Param('address') address, @Param('years') years) {
        try {
            console.log(`for ${years} years`)
            const response = await this.mainnetService.getLogs(address, years)
            return res.status(200).json(response)
        } catch (error) {
            console.log("Error in getting logs", error);
            return res.status(400).send(`Server Error ${error}`)
        }
    }

    @Get('/balance/wallet/:address')
    async GetAllTokenBalances(@Res() res, @Param('address') address) {
        try {
            const response = await this.mainnetService.getAllTokenBalances(address)
            return res.status(200).send(response)
        } catch (error) {
            console.log("Error in getting logs", error);
            return res.status(400).send(`Server Error ${error}`)
        }
    }
    @Get('/alert/wallet/:address/:email')
    async SetWalletAlert(@Res() res, @Param('address') address, @Param('email') email) {
        try {
            const response = await this.mainnetService.setWalletAllert(address, email)
            return res.status(200).send(response)
        } catch (error) {
            console.log("Error in getting logs", error);
            return res.status(400).send(`Server Error ${error}`)
        }
    }
    @Post('alert/history/')
    async GetWalletEventsDB(@Res() res, @Body() body: any) {
        try {
            const response = await this.mainnetService.getWalletEventsDB(body)
            return  res.status(200).send(response)
        } catch (error) {
            return  res.status(400).send({ status: 'Error', message: error })
        }
    }
}


