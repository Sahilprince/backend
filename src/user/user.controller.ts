import { Body, Controller, Get, Post, Query, Req, Res, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CustomFilter } from 'src/filters/validation.exception';
import { LoginDto, RegisterDto } from './dto/userdto';
import { UserService } from './user.service';

type NewType = void;

@Controller('/user')
export class UserController {
    private fail_resp = {
        "status": "fail",
        "errCode": "01",
        "reason": {
            "reason_eng": 'Invalid syntax',
            "reason_code": "BAD REQUEST"
        }
    }
    private code = 400;

    private success_resp = {
        "status": "success",
        "errCode": "00"
    }

    constructor(private readonly userService: UserService) { }

    @Post('/login')
    @UseFilters(CustomFilter)
    @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
    login(@Req() req: any, @Res() res: any, @Body() body: LoginDto) {

        this.userService.login(body).then((result: any) => {
            res.cookie("token", result.token, {
                maxAge: 3600 * 1000,
                sameSite: 'none',
                httpOnly: true,
                secure: true,
                domain: req.hostname,
                path: '/',
                Partitioned: true,
            })
            res.status(200).json(result);
        }).catch((err) => {
            let fail_resp = {
                "status": "fail",
                "errCode": "01",
                "reason": {
                    "reason_eng": 'Invalid User',
                    "reason_code": "Unauthorized_User"
                }
            }
            res.status(400).json(fail_resp);
        });
    }

    @Post('/register')
    @UseFilters(CustomFilter)
    @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
    async register(@Req() req, @Res() res, @Body() body: RegisterDto): Promise<NewType> {

        this.userService.createUser(body).then((response) => {
            this.code = 200;
            this.success_resp['msg'] = response
            res.status(this.code).json(this.success_resp);
        }).catch(err => {

            this.fail_resp.reason.reason_eng = err
            res.status(this.code).json(this.fail_resp);
        })
    }
    @Post('check_auth')
    async refreshToken(@Res() res, @Body() jwtoken): Promise<void> {
        this.userService.checkToken(jwtoken).then((response) => {
            const check = {
                ...response,
                message: 'valid'
            }
            res.status(200).json(check);
        }).catch(err => {

            this.fail_resp.reason.reason_eng = err
            res.status(this.code).json(this.fail_resp);
        })


    }
}
