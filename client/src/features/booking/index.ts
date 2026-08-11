/**
 * Booking Feature Module
 * 
 * Provides lazy-loadable page factories for the booking feature.
 */

export const bookingPages = {
  BookingDetails: () => import("@/pages/BookingDetails"),
  TrackBooking: () => import("@/pages/TrackBooking"),
  AddReview: () => import("@/pages/AddReview"),
  MyPoints: () => import("@/pages/MyPoints"),
};
