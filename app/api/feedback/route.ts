import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import Feedback from '@/models/Feedback';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    console.log('Received feedback data:', body);
    
    const {
      name,
      email,
      meetingId,
      mentorId,
      menteeId,
      bookingId,
      sessionEffectiveness,
      mentorGuidance,
      platformExperience,
      whatWorkedWell,
      howToImprove,
      additionalComments,
    } = body;

    // Validate required fields with detailed logging
    const missing = [];
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!meetingId) missing.push('meetingId');
    if (!mentorId) missing.push('mentorId');
    if (!menteeId) missing.push('menteeId');
    
    if (missing.length > 0) {
      console.log('Missing required fields:', missing);
      console.log('Received values:', { name, email, meetingId, mentorId, menteeId });
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      console.log('Invalid mentor ID:', mentorId);
      return NextResponse.json(
        { error: 'Invalid mentor ID format' },
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(menteeId)) {
      console.log('Invalid mentee ID:', menteeId);
      return NextResponse.json(
        { error: 'Invalid mentee ID format' },
        { status: 400 }
      );
    }

    if (bookingId && !mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    // Validate ratings
    if (
      !sessionEffectiveness || sessionEffectiveness < 1 || sessionEffectiveness > 10 ||
      !mentorGuidance || mentorGuidance < 1 || mentorGuidance > 10 ||
      !platformExperience || platformExperience < 1 || platformExperience > 10
    ) {
      console.log('Invalid ratings:', { sessionEffectiveness, mentorGuidance, platformExperience });
      return NextResponse.json(
        { error: 'All ratings must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Check if feedback already exists for this meeting and mentee
    const existingFeedback = await Feedback.findOne({
      meetingId,
      menteeId: new mongoose.Types.ObjectId(menteeId),
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback already submitted for this meeting' },
        { status: 409 }
      );
    }

    // Skip user verification for now to simplify testing
    // TODO: Re-enable user verification in production
    // const mentor = await User.findById(mentorId);
    // const mentee = await User.findById(menteeId);
    // if (!mentor || !mentee) {
    //   return NextResponse.json(
    //     { error: 'Mentor or mentee not found' },
    //     { status: 404 }
    //   );
    // }

    // Create feedback
    const feedback = new Feedback({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      meetingId,
      mentorId: new mongoose.Types.ObjectId(mentorId),
      menteeId: new mongoose.Types.ObjectId(menteeId),
      bookingId: bookingId ? new mongoose.Types.ObjectId(bookingId) : undefined,
      sessionEffectiveness: Number(sessionEffectiveness),
      mentorGuidance: Number(mentorGuidance),
      platformExperience: Number(platformExperience),
      whatWorkedWell: whatWorkedWell?.trim() || '',
      howToImprove: howToImprove?.trim() || '',
      additionalComments: additionalComments?.trim() || '',
    });

    const savedFeedback = await feedback.save();

    return NextResponse.json({
      message: 'Feedback submitted successfully',
      feedbackId: savedFeedback._id,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating feedback:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get('mentorId');
    const menteeId = searchParams.get('menteeId');
    const meetingId = searchParams.get('meetingId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (mentorId) {
      if (!mongoose.Types.ObjectId.isValid(mentorId)) {
        return NextResponse.json(
          { error: 'Invalid mentor ID' },
          { status: 400 }
        );
      }
      query.mentorId = new mongoose.Types.ObjectId(mentorId);
    }

    if (menteeId) {
      if (!mongoose.Types.ObjectId.isValid(menteeId)) {
        return NextResponse.json(
          { error: 'Invalid mentee ID' },
          { status: 400 }
        );
      }
      query.menteeId = new mongoose.Types.ObjectId(menteeId);
    }

    if (meetingId) {
      query.meetingId = meetingId;
    }

    // Get feedback with pagination
    const feedbacks = await Feedback.find(query)
      .populate('mentorId', 'firstName lastName email')
      .populate('menteeId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Feedback.countDocuments(query);

    // Calculate average ratings for the query
    const averageRatings = await Feedback.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgSessionEffectiveness: { $avg: '$sessionEffectiveness' },
          avgMentorGuidance: { $avg: '$mentorGuidance' },
          avgPlatformExperience: { $avg: '$platformExperience' },
          totalFeedbacks: { $sum: 1 },
        },
      },
    ]);

    const stats = averageRatings.length > 0 ? averageRatings[0] : {
      avgSessionEffectiveness: 0,
      avgMentorGuidance: 0,
      avgPlatformExperience: 0,
      totalFeedbacks: 0,
    };

    return NextResponse.json({
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        averageSessionEffectiveness: Math.round(stats.avgSessionEffectiveness * 10) / 10,
        averageMentorGuidance: Math.round(stats.avgMentorGuidance * 10) / 10,
        averagePlatformExperience: Math.round(stats.avgPlatformExperience * 10) / 10,
        totalFeedbacks: stats.totalFeedbacks,
      },
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
