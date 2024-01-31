import { IsDefined, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";


export class UserDto {
    @IsDefined({message: 'Name Cannot be empty'})
    @IsNotEmpty({message: 'Name Cannot be empty'})
    @IsString()
    name : String

    @IsDefined({message: 'Email Cannot be empty'})
    @IsNotEmpty({message: 'Email Cannot be empty'})
    email : String

    @IsDefined({message: 'Password Cannot be empty'})
    @IsNotEmpty({message: 'Password Cannot be empty'})
    @IsString()
    password : String;
}


export class LoginDto{
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    email : string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    password : String;
}

export class RegisterDto extends UserDto  {}
