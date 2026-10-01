export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/home', '/notices', '/vote', '/dues', '/profile'],
};
