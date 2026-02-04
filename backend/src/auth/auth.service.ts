import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Create User (Password hashed automatically in Schema hook)
    const user = await this.usersService.create(createUserDto);

    // Auto-login after register (Optional) or return success
    return {
      message: 'User registered successfully',
      user: { id: user._id.toString(), email: user.email, role: user.role }
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // A. Find User
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // B. Check Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // C. Generate Token
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    };
  }
}