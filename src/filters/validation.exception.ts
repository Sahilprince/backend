import { Inject, LoggerService, UnauthorizedException } from '@nestjs/common';

import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter
} from '@nestjs/common';


@Catch()
export class CustomFilter<T> implements ExceptionFilter {
    private resp = {
        "status": "fail",
        "errCode": "01",
        "reason": {
            "reason_eng": 'Invalid syntax',
            "reason_code": "BAD REQUEST"
        }
    }
    constructor() { }
    catch(exception: T, host: ArgumentsHost) {
        
        if(exception instanceof UnauthorizedException){
            const response = host.switchToHttp().getResponse();
            const resp:any = exception.getResponse()
            this.resp.reason.reason_eng = resp['message']
            response.status(resp.statusCode).json(this.resp);
        }else if (exception instanceof BadRequestException) {
            const response = host.switchToHttp().getResponse();
            const resp = exception.getResponse()
            this.resp.reason.reason_eng = resp['message'][0]
            response.status(400).json(this.resp);
        } else {
            console.log(exception)
            const response = host.switchToHttp().getResponse();
            let resp = {};
            let logData = {};
            const context = host.switchToHttp();
            const req = context.getRequest<Request>();
            logData["message"] = resp["message"] = exception["message"];

            if (exception["config"] !== undefined) {
                if (exception["config"]['url'] !== undefined) {
                    logData["url"] = exception["config"]['url']
                }
            }
            response.status(400).json(this.resp);
        }
    }
    prettyJSON(obj) {
        console.log(JSON.stringify(obj, null, 2));
    }
}


