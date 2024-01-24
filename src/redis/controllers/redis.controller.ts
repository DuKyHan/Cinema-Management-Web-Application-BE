import { Controller, Get, Inject } from "@nestjs/common";
import { RedisService } from "../services";
import { Public } from "src/auth/decorators";

@Controller('redis')
export class RedisController {
    constructor(private readonly redisService: RedisService) {

    }

    @Public()
    @Get('test')
    async test() {
       return this.redisService.get('test');
    }

}