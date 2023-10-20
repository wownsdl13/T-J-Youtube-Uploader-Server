import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as Process from 'process';
import { Request } from 'express'; // Use this import for Express
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access-token') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: any): Promise<any> {
    return payload;
  }
}
