import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // POST /auth/register
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    // Ajusta a como creas usuarios en tu UsersService.
    // Debe devolver el usuario creado (con id/email).
    const user = await this.usersService.createUserWithRoles(dto);
    return { id: user.id, email: user.email };
  }

  // POST /auth/login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    // Retorna { access_token }
    return this.authService.login(dto.email, dto.password);
  }

 @UseGuards(JwtAuthGuard)
@Get('me')
getMe(@Req() req: any) {
  return req.user; // { sub, email, roles: [...] }
}

}
