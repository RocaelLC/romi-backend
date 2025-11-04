"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtB2CGuard = void 0;
const common_1 = require("@nestjs/common");
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
let JwtB2CGuard = class JwtB2CGuard {
    constructor() {
        this.jwksClient = (0, jwks_rsa_1.default)({
            jwksUri: process.env.B2C_JWKS_URI, // ej: https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/discovery/keys
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 10 * 60 * 1000, // 10 min
            rateLimit: true,
            jwksRequestsPerMinute: 10,
        });
    }
    async canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        if (!token)
            throw new common_1.UnauthorizedException('Missing Bearer token');
        // 1) Decode to get KID
        const decoded = jsonwebtoken_1.default.decode(token, { complete: true });
        const kid = decoded?.header?.kid;
        if (!kid)
            throw new common_1.UnauthorizedException('Invalid token header');
        // 2) Get signing key
        const key = await this.jwksClient.getSigningKey(kid);
        const publicKey = key.getPublicKey();
        // 3) Verify with expected iss/aud from OpenID-Config
        const { iss, aud } = await this.getIssuerAndAud();
        try {
            const verified = jsonwebtoken_1.default.verify(token, publicKey, {
                audience: aud,
                issuer: iss,
            });
            req.user = verified; // attach claims to request
            return true;
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Token verification failed');
        }
    }
    async getIssuerAndAud() {
        // B2C_OPENID_CONFIG ej: https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policy>/v2.0/.well-known/openid-configuration
        const { data } = await axios_1.default.get(process.env.B2C_OPENID_CONFIG);
        return { iss: data.issuer, aud: process.env.B2C_CLIENT_ID };
    }
};
exports.JwtB2CGuard = JwtB2CGuard;
exports.JwtB2CGuard = JwtB2CGuard = __decorate([
    (0, common_1.Injectable)()
], JwtB2CGuard);
