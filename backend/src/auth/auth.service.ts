import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private blacklistedTokens = new Set<string>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Force role to PARTICIPANT — admins are created via the admin API only
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.PARTICIPANT,
    });

    // Generate JWT token for auto-login after registration
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find User
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid Email');
    }

    // Check Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Password');
    }

    // Generate Token
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      success: true,
      message: 'Login successful',
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  logout(token: string) {
    this.blacklistedTokens.add(token);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
}
