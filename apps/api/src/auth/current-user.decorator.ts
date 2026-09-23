import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '@ascendiaos/shared';

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext): UserPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserPayload;

    return data ? user?.[data] : user;
  },
);
