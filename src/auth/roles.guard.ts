// src/auth/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { roles?: string[] } | undefined;
    if (!user) throw new ForbiddenException('Unauthorized');
    const ok = (user.roles ?? []).some((r) => required.includes(r));
    if (!ok) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
