import session from 'express-session';

// Middleware de sesión simple para mantener estado LTI
export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'lti-tool-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
});