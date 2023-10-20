import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccessAuthGuard extends AuthGuard('access-token') {}
