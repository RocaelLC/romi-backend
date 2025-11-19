// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

type RoleLike = { name: string };
type UserLike = {
  id: number;
  email: string;
  password_hash: string; // ← usa el nombre real del campo
  role?: RoleLike | null; // relación 1:1
  roles?: RoleLike[] | null; // solo por compatibilidad si existiera N:M
};

@Injectable()
export class AuthService {
  // (opcional) para más adelante
  register(dto: RegisterDto) {
    throw new Error('Method not implemented.');
  }

  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  private async validateUser(email: string, pass: string): Promise<UserLike> {
    const user = (await this.usersService.findByEmailWithRoles(email)) as UserLike | null;

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(pass, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(email: string, pass: string) {
    const user = await this.validateUser(email, pass);

    // Construye el arreglo de roles. Si solo tienes 1:1, toma user.role
    const roles: string[] =
      Array.isArray(user.roles) && user.roles?.length
        ? user.roles.map((r: RoleLike) => r.name)
        : (user.role?.name ? [user.role.name] : []);

    const payload = { sub: user.id, email: user.email, name: (user as any).name, roles };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token };
  }
}
