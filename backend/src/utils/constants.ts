// filepath: server/src/utils/constants.ts
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ROUTES = {
  POSTS: '/api/posts',
  NOTIFICATIONS: '/api/notifications',
  USERS: '/api/users',
} as const;

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized',
  SERVER_ERROR: 'Internal server error',
} as const;