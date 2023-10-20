import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../entities/user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTag } from '../entities/user.tag';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AccessStrategy } from '../utils/jwt/access/access.strategy';
import { RefreshStrategy } from '../utils/jwt/refresh/refresh.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, UserTag]),
  ],
  controllers: [UserController],
  providers: [UserService, AccessStrategy, RefreshStrategy],
})
export class UserModule {}
