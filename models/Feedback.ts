import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  _id: string;
  name: string;
  email: string;
  meetingId: string;
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  
  // Rating fields (1-10 scale)
  sessionEffectiveness: number;
  mentorGuidance: number;
  platformExperience: number;
  
  // Open-ended feedback
  whatWorkedWell?: string;
  howToImprove?: string;
  additionalComments?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  meetingId: {
    type: String,
    required: true,
  },
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  menteeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
  },
  
  // Rating fields (1-10 scale)
  sessionEffectiveness: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  mentorGuidance: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  platformExperience: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  
  // Open-ended feedback
  whatWorkedWell: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  howToImprove: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  additionalComments: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
feedbackSchema.index({ meetingId: 1 });
feedbackSchema.index({ mentorId: 1, createdAt: -1 });
feedbackSchema.index({ menteeId: 1, createdAt: -1 });
feedbackSchema.index({ createdAt: -1 });

// Ensure one feedback per meeting per user
feedbackSchema.index({ meetingId: 1, menteeId: 1 }, { unique: true });

const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', feedbackSchema);

export default Feedback;
