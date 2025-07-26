import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'NEXT_PUBLIC_STREAM_API_KEY',
    'STREAM_SECRET_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    return NextResponse.json(
      {
        error: 'Missing required environment variables',
        missing: missingEnvVars,
        message: 'Please check your .env.local file and ensure all required variables are set.'
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: 'Environment configuration is valid',
      configured: requiredEnvVars,
    },
    { status: 200 }
  );
}
