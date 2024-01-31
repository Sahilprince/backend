import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from 'src/schema/users.schema';


@Module({
  imports:[MongooseModule.forFeature([{name:'Users', schema: userSchema}])],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
