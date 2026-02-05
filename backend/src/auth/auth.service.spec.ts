import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

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
    let usersService: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Register Success
    it('should register a new user', async () => {
        mockUsersService.findByEmail.mockResolvedValue(null);
        mockUsersService.create.mockResolvedValue(mockUser);

        const dto = { fullName: 'Yassine', email: 'test@example.com', password: '1234abcd' };
        const result = await service.register(dto);

        expect(result).toHaveProperty('message', 'User registered successfully');
        expect(usersService.create).toHaveBeenCalled();
    });

    // Register Fail (Email Exists)
    it('should throw ConflictException if email exists', async () => {
        mockUsersService.findByEmail.mockResolvedValue(mockUser);

        const dto = { fullName: 'Yassine', email: 'test@example.com', password: '1234abcd' };

        await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    // Login Success
    it('should login and return token', async () => {
        mockUsersService.findByEmail.mockResolvedValue(mockUser);

        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

        const result = await service.login({ email: 'test@example.com', password: 'correct_password' });

        expect(result).toHaveProperty('access_token', 'fake_jwt_token');
        expect(result.user.email).toBe('test@example.com');
    });

    // Login Fail (User Not Found)
    it('should throw UnauthorizedException if user not found', async () => {
        mockUsersService.findByEmail.mockResolvedValue(null);

        await expect(
            service.login({ email: 'wrong@example.com', password: '1234abcd' }),
        ).rejects.toThrow(UnauthorizedException);
    });

    // Login Fail (Wrong Password)
    it('should throw UnauthorizedException if password incorrect', async () => {
        mockUsersService.findByEmail.mockResolvedValue(mockUser);

        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

        await expect(
            service.login({ email: 'test@example.com', password: 'wrong_password' }),
        ).rejects.toThrow(UnauthorizedException);
    });
});