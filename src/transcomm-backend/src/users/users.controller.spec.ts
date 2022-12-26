import { Test, TestingModule } from '@nestjs/testing';
import { UserRequest } from 'models/request.models';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import httpMocks from 'node-mocks-http';
import { Prisma } from '@prisma/client';
import mock from 'jest-mock-extended/lib/Mock';
import { UserRole } from 'core';

describe('Users controller', () => {
  let module: TestingModule;
  let userController: UsersController;
  let mockUserService: UsersService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mock<UsersService>() }],
    }).compile();

    mockUserService = module.get<UsersService>(UsersService);
    userController = module.get<UsersController>(UsersController);
  });

  afterAll(async () => module.close());

  describe('setup', () => {
    it('should be defined"', () => {
      expect(userController).toBeDefined();
    });
  });

  describe('endpoints', () => {
    it('should get current user', () => {
      const req = httpMocks.createRequest({
        user: {
          email: 'test',
          firstName: 'test',
          id: '12341',
          lastName: 'last',
        },
      }) as UserRequest;
      const result = userController.getCurrentUser(req);
      expect(result.email).toBe(req.user.email);
    });

    it('register user', async () => {
      const userToCreate: Prisma.UserCreateInput = {
        email: 'test',
        firstName: 'name',
        lastName: 'last',
        password: 'asdasd',
        role: UserRole.admin,
      };
      jest.spyOn(mockUserService, 'createUser').mockResolvedValue({
        email: userToCreate.email,
        firstName: userToCreate.firstName,
        lastName: userToCreate.lastName,
        id: 'newId',
        role: userToCreate.role,
        locked: false,
      });
      const req = httpMocks.createRequest({
        user: {
          email: 'test',
          firstName: 'test',
          id: '12341',
          lastName: 'last',
          role: UserRole.admin,
        },
      }) as UserRequest;
      const result = await userController.registerUser(userToCreate, req);
      expect(result.email).toBe(userToCreate.email);
    });

    it('register user fails', () => {
      const userToCreate: Prisma.UserCreateInput = {
        email: 'test',
        firstName: 'name',
        lastName: 'last',
        password: 'asdasd',
        role: UserRole.admin,
      };
      const req = httpMocks.createRequest({
        user: {
          email: 'test',
          firstName: 'test',
          id: '12341',
          lastName: 'last',
          role: UserRole.admin,
        },
      }) as UserRequest;
      jest
        .spyOn(mockUserService, 'createUser')
        .mockRejectedValue(new Error('failed'));
      expect(() =>
        userController.registerUser(userToCreate, req),
      ).rejects.toThrowError();
    });
  });
});
