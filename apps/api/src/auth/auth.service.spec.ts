import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto = { email: 'test@example.com', password: 'password123', fullName: 'Test User' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        passwordHash: 'hashed_password',
        fullName: dto.fullName,
      });

      const result = await service.register(dto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mocked_jwt_token');
      expect(result.user).toEqual({ id: 'user-1', email: dto.email, fullName: dto.fullName });
    });

    it('should throw ConflictException if user already exists', async () => {
      const dto = { email: 'existing@example.com', password: 'password123', fullName: 'Test User' };
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1', email: dto.email });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        passwordHash: hashedPassword,
        fullName: 'Test User',
      });

      const result = await service.login(dto);

      expect(result.accessToken).toBe('mocked_jwt_token');
      expect(result.user).toEqual({ id: 'user-1', email: dto.email, fullName: 'Test User' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const dto = { email: 'nonexistent@example.com', password: 'password123' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const dto = { email: 'test@example.com', password: 'wrongpassword' };
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        passwordHash: hashedPassword,
        fullName: 'Test User',
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
