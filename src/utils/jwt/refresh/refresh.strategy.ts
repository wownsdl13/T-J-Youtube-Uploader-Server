import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import * as Process from 'process';

@Injectable()
export class RefreshStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: Process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: any): Promise<any> {
    return payload;
  }
}
