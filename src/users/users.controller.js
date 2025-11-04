"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_b2c_guard_1 = require("../auth/jwt-b2c.guard");
const users_service_1 = require("./users.service");
const upsert_user_dto_1 = require("./dto/upsert-user.dto");
const class_validator_1 = require("class-validator");
let UsersController = class UsersController {
    constructor(users) {
        this.users = users;
    }
    async upsert(body, req) {
        // validación manual por si no usas ValidationPipe global
        const errors = (0, class_validator_1.validateSync)(Object.assign(new upsert_user_dto_1.UpsertUserDto(), body));
        if (errors.length)
            return { ok: false, errors };
        const claims = req.user; // set por JwtB2CGuard
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || undefined;
        const user = await this.users.upsertFromB2C(claims, body, ip);
        return { ok: true, user: { id: user.id, role: user.role, email: user.email, displayName: user.display_name } };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('upsert'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_b2c_guard_1.JwtB2CGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_user_dto_1.UpsertUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "upsert", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('/api/v1/users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
