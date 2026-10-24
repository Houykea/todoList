import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public so the global JwtAuthGuard lets it through without a
 * token. Everything is protected by default — you must opt OUT on purpose.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
