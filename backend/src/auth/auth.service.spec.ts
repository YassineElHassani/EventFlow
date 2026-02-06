import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../users/schemas/user.schema';

// Mock bcrypt at the module level
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

// Mock UsersService
const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

// Mock JwtService
const mockJwtService = {
  sign: jest.fn().mockReturnValue('fake_jwt_token'),
};

// Mock User Data
const mockUser = {
  _id: 'userId123',
  fullName: 'Yassine Dev',
  email: 'test@example.com',
  password: 'hashed_password_123',
  role: 'participant',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Register Success
  it('should register a new user', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);
    mockUsersService.create.mockResolvedValue(mockUser);

    const dto = {
      fullName: 'Yassine',
      email: 'test@example.com',
      password: '1234abcd',
    };
    const result = await service.register(dto);

    expect(result).toHaveProperty('message', 'User registered successfully');
    expect(mockUsersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.PARTICIPANT }),
    );
  });

  // Register Fail (Email Exists)
  it('should throw ConflictException if email exists', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);

    const dto = {
      fullName: 'Yassine',
      email: 'test@example.com',
      password: '1234abcd',
    };

    await expect(async () => await service.register(dto)).rejects.toThrow(
      ConflictException,
    );
  });

  // Login Success
  it('should login and return token', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({
      email: 'test@example.com',
      password: 'correct_password',
    });

    expect(result).toHaveProperty('success', true);
    expect(result.data.user.email).toBe('test@example.com');
  });

  // Login Fail (User Not Found)
  it('should throw UnauthorizedException if user not found', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    await expect(
      async () =>
        await service.login({
          email: 'wrong@example.com',
          password: '1234abcd',
        }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // Login Fail (Wrong Password)
  it('should throw UnauthorizedException if password incorrect', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      async () =>
        await service.login({
          email: 'test@example.com',
          password: 'wrong_password',
        }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // Logout
  it('should blacklist token on logout', () => {
    const token = 'some_jwt_token';
    const result = service.logout(token);

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('message', 'Logged out successfully');
    expect(service.isTokenBlacklisted(token)).toBe(true);
  });

  it('should return false for non-blacklisted token', () => {
    expect(service.isTokenBlacklisted('valid_token')).toBe(false);
  });
});
