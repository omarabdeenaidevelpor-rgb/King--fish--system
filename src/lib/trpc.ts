import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../router.ts';

export const trpc = createTRPCReact<AppRouter>();
