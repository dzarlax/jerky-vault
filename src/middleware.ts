import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Извлекаем токен из заголовка Authorization
  const authHeader = req.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : null;

  // Список защищённых маршрутов страниц
  const protectedRoutes = [
    '/index',
    '/cookingSessions',
  ];

  // Проверка защищённых маршрутов страниц
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      console.log('Middleware: No token found, redirecting to login');
      const url = req.nextUrl.clone();
      url.pathname = '/auth/signin';
      return NextResponse.redirect(url);
    }

    try {
      // Проверка валидности токена
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/signin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
