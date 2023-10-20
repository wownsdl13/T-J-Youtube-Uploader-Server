import { createParamDecorator } from '@nestjs/common';
export const Jwt = createParamDecorator((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
