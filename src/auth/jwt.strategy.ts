import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

type JwtPayload = { sub: string; email: string; roles?: string[] };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {
    const cookieExtractor = (req: any): string | null => {
      try {
        const raw = req?.headers?.cookie as string | undefined;
        if (!raw) return null;
        const found = raw
          .split(';')
          .map((s) => s.trim())
          .find((p) => p.startsWith('access_token='));
        return found ? decodeURIComponent(found.split('=')[1] || '') : null;
      } catch {
        return null;
      }
    };

    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      // Read the same secret the JwtModule uses
      secretOrKey: config.get<string>('JWT_SECRET', 'dev_secret'),
      ignoreExpiration: false,
    };
    super(opts);
  }

  private normalizeRolesUnknown(input: unknown): string[] {
    if (!Array.isArray(input)) return [];
    return input
      .map((r) => (typeof r === 'string' ? r : (r && (r as any).name)))
      .filter((x): x is string => Boolean(x));
  }

  async validate(payload: JwtPayload) {
    if (payload.roles?.length) {
      return { sub: payload.sub, email: payload.email, roles: payload.roles };
    }
    let userAny: unknown = null;
    try {
      userAny = await this.usersService.findById(payload.sub);
    } catch {}
    const roles = this.normalizeRolesUnknown((userAny as any)?.roles);
    return { sub: payload.sub, email: payload.email, roles };
  }
}
