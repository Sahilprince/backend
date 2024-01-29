import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MainnetModule } from './ethereum/mainnet/mainnet.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';

config({ path: process.cwd() + '../.env' });


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
  }),
  MongooseModule.forRoot(process.env.DB_URI, { dbName: process.env.DB_NAME }),
  MainnetModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
