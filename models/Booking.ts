import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  _id: string;
  menteeId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  scheduledDateTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  description?: string;
  duration: number;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  menteeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scheduledDateTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  description: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 60, // 60 minutes default
  },
  meetingLink: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
bookingSchema.index({ menteeId: 1, scheduledDateTime: 1 });
bookingSchema.index({ mentorId: 1, scheduledDateTime: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
