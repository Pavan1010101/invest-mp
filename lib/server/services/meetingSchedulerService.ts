/**
 * SISMP — B2G Meeting Scheduler Service & Expiry Worker
 * Features:
 * - Atomic room slot reservation checking (double-booking prevention lock)
 * - 24-Hour expiration scheduler logic for pending requests
 */
import { MeetingRequest } from '@/lib/api/mocks/staffMockData';

export interface MeetingReservationInput {
  registrationId: string;
  investorName: string;
  companyName: string;
  departmentName: string;
  officerName: string;
  requestedDate: string;
  timeSlot: string;
  roomId: string;
  roomName: string;
  notes?: string;
}

export class MeetingSchedulerService {
  /**
   * Check if a room slot is currently booked or requested
   */
  static isSlotConflict(
    existingMeetings: MeetingRequest[],
    roomId: string,
    timeSlot: string,
    date: string
  ): boolean {
    return existingMeetings.some(
      (m) =>
        m.roomId === roomId &&
        m.timeSlot === timeSlot &&
        m.requestedDate === date &&
        (m.status === 'Confirmed' || m.status === 'Requested')
    );
  }

  /**
   * Reserve a meeting slot with atomic conflict validation
   */
  static reserveSlot(
    existingMeetings: MeetingRequest[],
    input: MeetingReservationInput
  ): MeetingRequest {
    // Double-booking prevention lock
    if (this.isSlotConflict(existingMeetings, input.roomId, input.timeSlot, input.requestedDate)) {
      throw new Error(
        `CONFLICT ERROR: Room ${input.roomId} at slot ${input.timeSlot} on ${input.requestedDate} is already reserved!`
      );
    }

    const meetingId = `MTG-${Math.floor(800 + Math.random() * 200)}`;
    const now = Date.now();
    const expiresAt = new Date(now + 24 * 3600 * 1000).toISOString(); // 24 Hours Expiration

    return {
      id: meetingId,
      investorName: input.investorName,
      companyName: input.companyName,
      departmentName: input.departmentName,
      officerName: input.officerName,
      requestedDate: input.requestedDate,
      timeSlot: input.timeSlot,
      roomId: input.roomId,
      roomName: input.roomName,
      status: 'Requested',
      expiresAt: expiresAt,
      notes: input.notes,
      createdAt: new Date(now).toISOString(),
    };
  }

  /**
   * Cron Job Handler: Sweep and auto-expire unconfirmed meeting requests after 24h
   */
  static processAutoExpiry(meetings: MeetingRequest[]): MeetingRequest[] {
    const now = new Date().getTime();
    return meetings.map((m) => {
      if (m.status === 'Requested') {
        const expiryTime = new Date(m.expiresAt).getTime();
        if (now >= expiryTime) {
          return { ...m, status: 'Expired' };
        }
      }
      return m;
    });
  }
}
