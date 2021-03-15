import { Context } from 'koa';
import { AccessMode, NextFunction } from '../types';
import { Routes } from './types';
export declare function verifyToken(routes: Routes, accessMode?: AccessMode): (ctx: Context, next: NextFunction) => Promise<void>;
//# sourceMappingURL=verify-token.d.ts.map