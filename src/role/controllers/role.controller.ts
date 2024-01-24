import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RoleService } from "../services";
import { Public } from "src/auth/decorators";
import { ReqContext, RequestContext } from "src/common/request-context";



@ApiTags('roles')
@Controller('roles')
export class RoleController {
    constructor(
        private readonly RoleService: RoleService
    ){}

    @Public()
    @Get()
    async createDefaultRoles(    @ReqContext() ctx: RequestContext,){
        return this.RoleService.createDefaultRoles(ctx)
    }
}
