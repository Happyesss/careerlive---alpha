'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/database';
import User from '@/models/User';
import { StreamClient } from '@stream-io/node-sdk';

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) throw new Error('User is not authenticated');

  const decoded = verifyToken(token);
  if (!decoded) throw new Error('Invalid token');

  await connectToDatabase();
  const user = await User.findById(decoded.userId);
  if (!user) throw new Error('User not found');

  if (!STREAM_API_KEY) throw new Error('Stream API key secret is missing');
  if (!STREAM_API_SECRET) throw new Error('Stream API secret is missing');

  const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const issuedAt = Math.floor(Date.now() / 1000) - 60;

  const streamToken = streamClient.createToken(user._id.toString(), expirationTime, issuedAt);

  return streamToken;
};
