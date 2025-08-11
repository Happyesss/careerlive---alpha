import { NextResponse } from 'next/server';
import Booking from '@/models/Booking';
import  connectToDatabase  from '@/lib/database'; // your DB connect function

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  const bookingId = params.id;
  const searchUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${bookingId}`
const booking = await Booking.findOne({ meetingLink: searchUrl });

  if (!booking || !booking.transcriptPdf) {
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
  }

  const pdfBuffer = booking.transcriptPdf; // This is a Buffer

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="transcript-${bookingId}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    },
  });
}
