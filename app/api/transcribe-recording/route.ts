import { NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';
import multer from 'multer';
import { promisify } from 'util';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import Booking from '@/models/Booking';

// Multer in App Router: create an instance for memory storage
const upload = multer({ storage: multer.memoryStorage() });
const runMiddleware = promisify(upload.single('file'));

// Google Speech client
const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export const runtime = 'nodejs'; // Ensure it runs in Node, not Edge

export async function POST(request: Request) {
  try {

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64 for Google STT
    const audioBytes = buffer.toString('base64');
    const audio = { content: audioBytes };
   const config = {
  encoding: 'WEBM_OPUS',
  languageCode: 'en-US',
  audioChannelCount: 2, // match the file header
  enableSeparateRecognitionPerChannel: false
};


    const requestObj = { audio, config };
    const [response] = await speechClient.recognize(requestObj);

    const transcription = response.results
      ?.map((result:any) => result.alternatives?.[0]?.transcript)
      .join('\n') || '';

    console.log('Transcription result:', transcription);


    // Generate PDF from transcription using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    const textLines = transcription.split('\n');
    let y = height - 50;

     for (const line of textLines) {
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: undefined,
        maxWidth: width - 100,
      });
      y -= fontSize + 5;
      if (y < 50) break; // simple page limit check, extend as needed
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);


    const bookingId = formData.get('bookingId') as string;
     const booking = await Booking.findOne({ meetingLink: bookingId });
if (!booking) {
  return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
}

// Assign new fields to booking document
booking.transcriptPdf = pdfBuffer;
booking.transcriptText = transcription;
booking.updatedAt = new Date();

await booking.save();

    await booking.save();
    console.log('Transcription and PDF generation completed successfully');
    return NextResponse.json({ transcript: transcription });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}


// import { NextResponse } from 'next/server';
// import { SpeechClient } from '@google-cloud/speech';
// import { PDFDocument, StandardFonts } from 'pdf-lib';
// import Booking from '@/models/Booking';

// const speechClient = new SpeechClient({
//   keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
// });

// export const runtime = 'nodejs';

// export async function POST(request: Request) {
//   try {

//     const bodyText = await request.text();
//     console.log('Raw request body:', bodyText);

//     if (!bodyText) {
//       return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
//     }


//     const { audioBase64, bookingId } = await request.json();

//     if (!audioBase64 || !bookingId) {
//           console.error('Error parsing JSON:', bodyText);

//       return NextResponse.json({ error: 'Missing audio or bookingId' }, { status: 400 });
//     }

//     // Prepare audio for Google Speech-to-Text
//     const audio = { content: audioBase64 };
//     const config = {
//       encoding: 'WEBM_OPUS',
//       languageCode: 'en-US',
//       audioChannelCount: 2,
//       enableSeparateRecognitionPerChannel: false,
//     };

//     const requestObj = { audio, config };
//     const [response] = await speechClient.recognize(requestObj);

//     const transcription = response.results
//       ?.map((result: any) => result.alternatives?.[0]?.transcript)
//       .join('\n') || '';

//     // Generate PDF with transcription text
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage();
//     const { width, height } = page.getSize();
//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//     const fontSize = 12;

//     let y = height - 50;
//     for (const line of transcription.split('\n')) {
//       page.drawText(line, {
//         x: 50,
//         y,
//         size: fontSize,
//         font,
//         maxWidth: width - 100,
//       });
//       y -= fontSize + 5;
//       if (y < 50) break; // simple page limit check
//     }

//     const pdfBytes = await pdfDoc.save();
//     const pdfBuffer = Buffer.from(pdfBytes);

//     // Save transcript and PDF to booking document
//     const booking = await Booking.findOne({ meetingLink: bookingId });
//     if (!booking) {
//       return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
//     }

//     booking.transcriptPdf = pdfBuffer;
//     booking.transcriptText = transcription;
//     booking.updatedAt = new Date();

//     await booking.save();
//     console.log(transcription)
//     return NextResponse.json({ transcript: transcription });
//   } catch (error) {
//     console.error('Transcription error:', error);
//     return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
//   }
// }
