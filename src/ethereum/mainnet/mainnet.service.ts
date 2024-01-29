import { Injectable, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { ethers } from 'ethers';
import mongoose, { Model } from 'mongoose';
import { WalletBalance } from 'src/schema/WalletBalance.schema';

const utils = ethers
@Injectable()
export class MainnetService {
    constructor(
        @InjectModel(WalletBalance.name)
        private readonly walletBalanceModel: Model<WalletBalance>,
    ) { }

    // private TOKEN_LISTS: any = {
    //     Ethereum: 'https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/ethereum.json'
    // }
    private provider(): ethers.providers.JsonRpcProvider {
        const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/YGt-xvQ_7wgLZNv7yyGmWSg-ZDyaiFKf')
        return provider;

    }
    async getBalance(address: string): Promise<number> {
        const provider = this.provider();
        const balance = await provider.getBalance(address);
        // const balanceInEth = utils.formatUnits(balance)
        return Number(balance);
    }

    async getLogs(walletAddress: string, years: number): Promise<any> {
        const provider = new ethers.providers.EtherscanProvider()
        const days = years * 365
        const currentBlock = await provider.getBlockNumber()
        const FromBlock = currentBlock - Math.ceil(60 * 60 * 24 * days / 13)
        const logs = await provider.getHistory(walletAddress, FromBlock, currentBlock)
        return logs;
    }

    async getAllTokenBalances(walletAddress: string): Promise<any[]> {
        try {
            const provider = this.provider();
            const tokenListsResponse = await axios.get('https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/ethereum.json');
            const tokenLists = tokenListsResponse.data;
            const block = await provider.getBlockNumber();
            const proms = [];
            const results = [];
            const ABI = await axios.get('https://gist.githubusercontent.com/veox/8800debbf56e24718f9f483e1e40c35c/raw/f853187315486225002ba56e5283c1dba0556e6f/erc20.abi.json')
            const ERC20_ABI = ABI.data

            // Find or create WalletBalance document for the wallet address
            let walletBalance = await this.walletBalanceModel.findOne({ walletAddress });
            if (!walletBalance) {
                walletBalance = new this.walletBalanceModel({ walletAddress, tokens: [] });
            }

            for (const tkn of tokenLists) {
                const erc20 = new ethers.Contract(tkn.address, ERC20_ABI, provider);
                proms.push(
                    erc20.balanceOf(walletAddress, {
                        blockTag: +block,
                    }).then(async result => {
                        // Convert balance to number using custom function
                        const balance = convertToNumber(result, tkn.decimals);
                        if (balance === 0) {
                            return null;
                        }

                        // Add token to the tokens array in WalletBalance document
                        walletBalance.tokens.push({
                            symbol: tkn.symbol,
                            name: tkn.name,
                            address: tkn.address,
                            decimals: tkn.decimals,
                            chainId: tkn.chainId,
                            logoURI: tkn.logoURI,
                        });

                        // Return the balance and token data
                        return {
                            balance,
                            name: tkn.name,
                            symbol: tkn.symbol,
                        };
                    }).catch(error => {
                        // Handle errors for rejected promises
                        console.error(`Failed to fetch balance for ${tkn.name}: ${error}`);
                        return null;
                    })
                );
            }

            // Save or update the WalletBalance document in the database
            const promiseResults = await Promise.allSettled(proms);
            console.log('Tokens to be saved:', walletBalance.tokens);
            await walletBalance.save();


            // Iterate through the settled promises and filter out the rejected ones
            for (const promiseResult of promiseResults) {
                if (promiseResult.status === 'fulfilled' && promiseResult.value) {
                    results.push(promiseResult.value);
                }
            }

            // console.log(results);
            console.log(results.length);
            return results;
        } catch (error) {
            console.error('Error fetching token balances:', error);
            throw error; // Rethrow the error to the caller
        }
    }



}

function convertToNumber(value: string, decimals: number): number {
    return parseFloat(value) / Math.pow(10, decimals);
}




