import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, User } from '@prisma/client';
import { UserRole } from 'core';
import { mockDeep, MockProxy } from 'jest-mock-extended';
import { DatabaseService } from '../database/database.service';
import { UserEnriched } from '../models/request.models';
import { UserCreateRequestDto } from './dto/userCreateRequest.dto';
import { UserEditPasswordRequestDto } from './dto/userEditPasswordRequest.dto';
import { UserEditRequestDto } from './dto/userEditRequest.dto';
import { UserResponseDto } from './dto/userResponse.dto';
import { UsersService } from './users.service';

export type Context = {
  prisma: PrismaClient;
};

export type MockContext = {
  prisma: MockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};

const mockConfig = {
  get: jest.fn((key: string) => {
    if (key === 'SUPERADMIN_EMAIL') {
      return 'super@admin.com';
    }
    if (key === 'SUPERADMIN_HASHED_PASSWORD') {
      return 'testhash';
    }
    return null;
  }),
};

const mockUser: User = {
  id: '1',
  password: 'testPassword',
  firstName: 'testFirstName',
  lastName: 'testLastName',
  email: 'testemail@email.mail',
  role: UserRole.admin,
  locked: false,
  archived: false,
  failedLoginAttempts: 0,
  passwordChangeRequired: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  archivedAt: null,
};

const mockUserReponse: UserResponseDto = {
  id: '1',
  firstName: 'testFirstName',
  lastName: 'testLastName',
  email: 'testemail@email.mail',
  role: UserRole.admin,
  locked: false,
};

const mockUserCreateRequestDto: UserCreateRequestDto = {
  password: 'testPassword',
  firstName: 'testFirstName',
  lastName: 'testLastName',
  email: 'testemail@email.mail',
  role: UserRole.admin,
};

const mockUserEditRequestDto: UserEditRequestDto = {
  id: '1',
  firstName: 'testFirstName',
  lastName: 'testLastName',
  email: 'testemail@email.mail',
  role: UserRole.admin,
};

const mockUserEnriched: UserEnriched = {
  ...mockUserReponse,
  passwordChangeRequired: false,
};

const mockEditPasswordRequestDto: UserEditPasswordRequestDto = {
  id: '1',
  password: 'Helloworld1!Helloworld1!',
};

describe('UsersService', () => {
  let service: UsersService;
  let context: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    context = createMockContext();
    ctx = context as unknown as Context;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: ctx.prisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    return expect(service).toBeDefined();
  });

  it('Finds all unarchived users', async () => {
    const mockPrismaResponse = [2, [mockUserReponse, mockUserReponse]];
    const mockPaginatedResponse = {
      data: [mockUserReponse, mockUserReponse],
      numberOfRecords: 2,
    };
    context.prisma.$transaction.mockResolvedValue(mockPrismaResponse);
    const result = await service.findAllUnarchived({});
    return expect(result).toEqual(mockPaginatedResponse);
  });

  it('Finds user by id', async () => {
    context.prisma.user.findFirst.mockResolvedValue(mockUser);
    const result = await service.findOneById(mockUser.id);
    return expect(result).toEqual(mockUser);
  });

  it('Finds user by email', async () => {
    context.prisma.user.findFirst.mockResolvedValue(mockUser);
    const result = await service.findOneValid(mockUser.email);
    return expect(result).toEqual(mockUser);
  });

  it('Creates user', async () => {
    context.prisma.user.create.mockResolvedValue(mockUser);
    const result = await service.createUser(
      mockUserCreateRequestDto,
      mockUserEnriched,
    );

    return expect(result).toEqual(mockUser);
  });

  it('Create user should throw error: super admin cannot be created', async () => {
    const mockUserDto = { ...mockUserCreateRequestDto };
    mockUserDto.role = UserRole.super_admin;

    return expect(
      service.createUser(mockUserDto, mockUserEnriched),
    ).rejects.toThrowError('Super admin cannot be created');
  });

  it('Create user should throw error: password needs to be changed', async () => {
    const mockEnriched = { ...mockUserEnriched };
    mockEnriched.passwordChangeRequired = true;

    return expect(
      service.createUser(mockUserCreateRequestDto, mockEnriched),
    ).rejects.toThrowError('Password of user needs to be changed');
  });

  it('Edits user', async () => {
    const mockUserEdited = { ...mockUser };
    mockUserEdited.firstName = 'changedFirstName';

    context.prisma.user.findFirst.mockResolvedValue(mockUser);
    context.prisma.user.update.mockResolvedValue(mockUserEdited);
    const result = await service.editUser(mockUserEditRequestDto);
    return expect(result).toEqual(mockUserEdited);
  });

  it('Edits user should throw error: admin role cannot be changed', async () => {
    const mockToEditorUser = { ...mockUser };
    mockToEditorUser.role = UserRole.editor;

    context.prisma.user.findFirst.mockResolvedValue(mockUser);
    return expect(service.editUser(mockToEditorUser)).rejects.toThrowError(
      'Admin role cannot be changed',
    );
  });

  it('Edits user should throw error: Viewer/editor cannot become admin', async () => {
    const mockViewerUser = { ...mockUser };
    mockViewerUser.role = UserRole.viewer;

    context.prisma.user.findFirst.mockResolvedValue(mockViewerUser);
    return expect(service.editUser(mockUser)).rejects.toThrowError(
      'Viewer/editor cannot become admin',
    );
  });

  it('Edits user password', async () => {
    context.prisma.user.findFirst.mockResolvedValue(mockUser);
    context.prisma.user.update.mockResolvedValue(mockUser);
    const result = await service.editPassword(mockEditPasswordRequestDto);
    return expect(result).toEqual(mockUser);
  });

  it('Edit user password should throw error: password does not match criteria', async () => {
    const mockInvalidRequest = { ...mockEditPasswordRequestDto };
    mockInvalidRequest.password = 'Helloworld1!';
    context.prisma.user.findFirst.mockResolvedValue(mockUser);
    context.prisma.user.update.mockResolvedValue(mockUser);
    return expect(
      service.editPassword(mockInvalidRequest),
    ).rejects.toThrowError();
  });

  it('Archives user', async () => {
    const mockArchivedUser = { ...mockUser };
    mockArchivedUser.archived = true;
    mockArchivedUser.archivedAt = new Date();

    context.prisma.user.findFirst.mockResolvedValue(mockUser);
    context.prisma.user.update.mockResolvedValue(mockArchivedUser);
    const result = await service.archiveUser('1', '2');
    return expect(result).toEqual(mockArchivedUser);
  });

  it('Archive user should throw error: User cannot delete itself', async () => {
    return expect(service.archiveUser('1', '1')).rejects.toThrowError(
      'User cannot delete itself',
    );
  });

  it('Adds extra login attempt without locking viewer user ', async () => {
    const mockFailedUser = { ...mockUser };

    const mockFailedUserAfter = { ...mockFailedUser };
    mockFailedUserAfter.failedLoginAttempts += 1;

    context.prisma.user.update.mockResolvedValue(mockFailedUserAfter);
    const result = await service.handleFailedLoginAttempt(mockFailedUser);
    return expect(result).toEqual(mockFailedUserAfter);
  });

  it('Created super admin', async () => {
    context.prisma.user.findFirst.mockResolvedValue(null);
    await service.onModuleInit();
    return expect(context.prisma.user.create).toBeCalledTimes(1);
  });

  it('Does not create super admin, because already super admin in db', async () => {
    context.prisma.user.findFirst.mockResolvedValue(mockUser);
    await service.onModuleInit();
    return expect(context.prisma.user.create).not.toBeCalled();
  });
});
