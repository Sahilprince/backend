import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UserDocument, Users } from 'src/schema/users.schema';
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { JwtService } from '@nestjs/jwt';
const jwt = require('jsonwebtoken')

@Injectable()
export class UserService {

    constructor(
        @InjectModel(Users.name) private readonly userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }
    createUser = async (registerDto) => {
        return new Promise(async (resolve, reject) => {
            const newUser = new this.userModel(registerDto);

            try {

                const user = await this.userModel.find({
                    $or: [{
                        email: newUser.email
                    }]
                })
                if (user.length > 0) {
                    reject("User Already Registered")
                } else {
                    const saltOrRounds = 10;
                    newUser.password = await bcrypt.hash(newUser.password, saltOrRounds)
                    newUser.email = newUser.email.toLowerCase()
                    newUser.save().then((result) => {
                        resolve(result)
                    }).catch((err) => {
                        console.log(err)
                        reject(err)
                    });
                }
            } catch (error) {
                console.log(error)
                reject("There is some error while creating User")
            }
        })
    }

    getUser = async (email) => {
        try {
            const user = await this.userModel.findOne({ email: email.toLowerCase() });

            if (!user) {
                return null;
            }
            return user;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    }


    login = async (body) => {
    
        return new Promise(async (resolve, reject) => {
            const user = await this.getUser(body.email)
            // let searchObj = {
            //     email: body.email.toLowerCase(),
            // }
            // const user = await this.userModel.findOne(searchObj)
            if (user != null) {
                const isMatch = await bcrypt.compare(body.password, user.password)
                if (isMatch) {
                    //create jwt tokens with required payload
                    let token = await this.jwtService.signAsync({ userId: body.email })
                    resolve( { user, token })
                } else {
                    reject("Please Enter a valid Password")
                }
            } else {
                reject("No User Found with this email-id.")
            }
        })
    }
    async checkToken(data) {
        const token = data.token
        return jwt.verify(token, process.env.REFRESH_KEY)
    }

}
