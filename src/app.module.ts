import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MainnetModule } from './ethereum/mainnet/mainnet.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { SocketModule } from './ethereum/websocket/socket.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

config({ path: process.cwd() + '../.env' });


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    JwtModule.register({
      global: true,
      secret: process.env.REFRESH_KEY,
      signOptions: { expiresIn: '21600s' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'build'),
      exclude: ['/api/(.*)', '/socket.io/(.*)'],
    }),
    MongooseModule.forRoot(process.env.DB_URI, { dbName: process.env.DB_NAME }),
    MainnetModule,
    UserModule,
    SocketModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
