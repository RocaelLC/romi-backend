import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
export { JwtAuthGuard as JwtB2CGuard } from './jwt-auth.guard';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_romi_secret',
    });
  }

  async validate(payload: any) {
    // payload lo definimos en AuthService.sign (id, role, email)
    return payload;
  }
}
