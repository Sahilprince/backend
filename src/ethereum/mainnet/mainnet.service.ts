import { Injectable, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { ethers } from 'ethers';
import mongoose, { Model } from 'mongoose';
import { WalletBalance } from 'src/schema/WalletBalance.schema';
import { Alchemy, Network, WebhookType } from 'alchemy-sdk';
import { wallet_events } from 'src/schema/walletAction.schema';
import { EventsGateway } from '../websocket/events/events.gateway';
const utils = ethers;
const settings = {
    authToken: 'bKBTdt1lk-xloB1Uqed1EW73vBlGvah9',
    network: Network.ETH_MAINNET, // Replace with your network.
};
const options = {
    method: 'POST',
    url: 'https://dashboard.alchemy.com/api/create-webhook',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    data: { network: 'ETH_MAINNET', webhook_type: 'GRAPHQL' }
};

const alchemy = new Alchemy(settings)
@Injectable()
export class MainnetService {
    constructor(
        @InjectModel(WalletBalance.name)
        private readonly walletBalanceModel: Model<WalletBalance>,
        @InjectModel(wallet_events.name)
        private readonly webhookPayloadModel: Model<wallet_events>,
        private readonly eventsGateway: EventsGateway,

    ) { }


    // private TOKEN_LISTS: any = {
    //     Ethereum: 'https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/ethereum.json'
    // }
    private provider(): ethers.providers.JsonRpcProvider {
        const provider = new ethers.providers.JsonRpcProvider(
            'https://eth-mainnet.g.alchemy.com/v2/YGt-xvQ_7wgLZNv7yyGmWSg-ZDyaiFKf',
        );
        return provider;
    }
    async getBalance(address: string): Promise<number> {
        const provider = this.provider();
        const balance = await provider.getBalance(address);

        return Number(balance);
    }
    async getLast10Transactions(walletAddress: string): Promise<any> {
        const provider = new ethers.providers.EtherscanProvider();
        const history = await provider.getHistory(walletAddress);
        const sortedHistory = history.sort((a, b) => b.blockNumber - a.blockNumber);
        const last10Transactions = sortedHistory.slice(0, 10);

        const transactionsInEther = last10Transactions.map(transaction => ({
            hash: transaction.hash,
            blockNumber: transaction.blockNumber,
            to: transaction.to,
            value: ethers.utils.formatEther(transaction.value._hex)
        }));

        return transactionsInEther;
    }



    async getLogs(walletAddress: string, years: number): Promise<any> {
        const provider = new ethers.providers.EtherscanProvider();
        const days = years * 365;
        const currentBlock = await provider.getBlockNumber();
        const FromBlock = currentBlock - Math.ceil((60 * 60 * 24 * days) / 13);
        const logs = await provider.getHistory(
            walletAddress,
            FromBlock,
            currentBlock,
        );
        const limitedHistory = logs.slice(0, 1000)
        const tnxHistory = limitedHistory.map(transaction => ({
            hash: transaction.hash,
            blockNumber: transaction.blockNumber,
            to: transaction.to,
            value: ethers.utils.formatEther(transaction.value._hex)
        }));

        return tnxHistory;
    }

    async getAllTokenBalances(targetAddress: string): Promise<any> {
        try {
            const provider = this.provider();
            const tokenListsResponse = await axios.get(
                'https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/ethereum.json',
            );
            const tokenLists = tokenListsResponse.data;
            const block = await provider.getBlockNumber();
            const proms = [];
            const results = [];
            const ABI = await axios.get(
                'https://gist.githubusercontent.com/veox/8800debbf56e24718f9f483e1e40c35c/raw/f853187315486225002ba56e5283c1dba0556e6f/erc20.abi.json',
            );
            const ERC20_ABI = ABI.data;


            let walletBalance = await this.walletBalanceModel.findOne({
                walletAddress: targetAddress,
            });
            console.log(walletBalance)
            if (walletBalance) {
                return walletBalance
            }
            else {
                walletBalance = new this.walletBalanceModel({
                    targetAddress,
                    tokens: [],
                });



                for (const tkn of tokenLists) {
                    const erc20 = new ethers.Contract(tkn.address, ERC20_ABI, provider);
                    proms.push(
                        erc20
                            .balanceOf(targetAddress, {
                                blockTag: +block,
                            })
                            .then(async (result) => {

                                const balance = convertToNumber(result, tkn.decimals);
                                if (balance === 0) {
                                    return null;
                                }


                                walletBalance.tokens.push({
                                    symbol: tkn.symbol,
                                    name: tkn.name,
                                    address: tkn.address,
                                    decimals: tkn.decimals,
                                    chainId: tkn.chainId,
                                    logoURI: tkn.logoURI,
                                });


                                return {
                                    balance,
                                    name: tkn.name,
                                    symbol: tkn.symbol,
                                };
                            })
                            .catch((error) => {

                                console.error(
                                    `Failed to fetch balance for ${tkn.name}: ${error}`,
                                );
                                return null;
                            }),
                    );
                }


                const promiseResults = await Promise.allSettled(proms);
                console.log('Tokens to be saved:', walletBalance.tokens);
                await walletBalance.save();

                for (const promiseResult of promiseResults) {
                    if (promiseResult.status === 'fulfilled' && promiseResult.value) {
                        results.push(promiseResult.value);
                    }
                }
                return results;
            }
        } catch (error) {
            console.error('Error fetching token balances:', error);
            throw error; // Rethrow the error to the caller
        }
    }
    async setWalletAllert(targetAddress: string, email: string): Promise<any> {
        try {

            // Check if there's an existing payload for the given email
            let existingPayload = await this.webhookPayloadModel.findOne({ email: email });

            if (!existingPayload) {

                // If no existing payload, create a new one
                existingPayload = new this.webhookPayloadModel({ walletAddress: targetAddress, email: email });

                // Create a webhook for address activity
                const addressActivityWebhook = await alchemy.notify.createWebhook(
                    process.env.SERVER_URL + targetAddress,
                    WebhookType.ADDRESS_ACTIVITY,
                    {
                        addresses: [targetAddress],
                        network: Network.ETH_MAINNET,
                    }
                );
                console.log(addressActivityWebhook)
                // Save the webhook details to the payload
                existingPayload.webhookId = addressActivityWebhook.id;
            }
            // Save or update the payload in the database
            return existingPayload.save();
        } catch (error) {
            console.log('Error while setting wallet alert:', error);
            throw error;
        }
    }

    async processWebhook(payload: any, targetAddress: string): Promise<void> {
        try {
            // Retrieve existing alerts from the database
            const walletAction = await this.webhookPayloadModel.findOne({ walletAddress: targetAddress });

            // Get the current alerts queue
            let alertsQueue = walletAction?.events || [];

            // Set the maximum size of the queue
            const maxQueueSize = 50;

            // Trim the queue if it exceeds the maximum size
            if (alertsQueue.length >= maxQueueSize) {
                alertsQueue.splice(0, alertsQueue.length - maxQueueSize + 1);
            }

            // Add the new alert to the queue
            alertsQueue.push(payload);

            // Save the updated queue back to the database
            const updatedWalletAction = await this.webhookPayloadModel.findOneAndUpdate(
                { walletAddress: targetAddress },
                { events: alertsQueue },
                { upsert: true, new: true }
            );

            console.log('Updated wallet action:', updatedWalletAction);

            // Send message to client using the latest data
            this.eventsGateway.sendMessageToClient(`${payload.event.activity[0].value} of ${payload.event.activity[0].asset} has been transferred from ${payload.event.activity[0].fromAddress} to ${payload.event.activity[0].toAddress}`);

            console.log(payload.event.activity[0].toAddress, "asdfghj");
        } catch (error) {
            console.error('Error processing webhook payload:', error);
            throw error;
        }
    }

    async getWalletEventsDB(email: string): Promise<any> {
        try {
            const response = await this.webhookPayloadModel.find().exec()
            return response;
        } catch (error) {
            throw error

        }
    }
}



// async removeWalletAllert(walletAddress: string): Promise<any> {
//     try {
//         const addressActivityWebhook = await alchemy.notify.createWebhook(
//             "https://webhook.site/03f3293a-11d7-4828-b51d-f6dd427c4972",
//             WebhookType.ADDRESS_ACTIVITY,
//             {
//                 addresses: [walletAddress],
//                 network: Network.ETH_MAINNET,
//             }
//         );
//         return addressActivityWebhook;
//     } catch (error) {
//         console.log('Error while setting wallet allert: ',error)
//         throw error;
//     }
// }


function convertToNumber(value: string, decimals: number): number {
    return parseFloat(value) / Math.pow(10, decimals);
}


