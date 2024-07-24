// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.SECRET });
  const { pathname } = req.nextUrl;

  // Список защищённых маршрутов
  const protectedRoutes = [
    '/addRecipe',
    '/ingredients',
    '/prices',
    '/index',
    // Добавьте другие маршруты здесь
  ];

  const protectedApiRoutes = [
    '/api/addRecipe',
    '/api/ingredients',
    '/api/prices',
    '/api/recipes',
    '/cookingSessions',
    // Добавьте другие API маршруты здесь
  ];

  // Проверка защищённых маршрутов страниц
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/signin';
      return NextResponse.redirect(url);
    }
  }

  // Проверка защищённых API маршрутов
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  }

  return NextResponse.next();
}
