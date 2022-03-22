import { Resource } from '../../BaseResource'
import { SourceRequestOptions } from '../../SourceClient'
import { User } from '../User'
import { Expandable } from '../shared'

export interface Slot {
  /**
   * Always `slot`.
   */
  object: 'slot'
  /**
   * The start time of this appointment slot. Slot start times will be calculated
   * based on the available times of the bookable resources, as well as the selected
   * appointment type's slot interval.
   */
  start_at: string
  /**
   * The end time of this appointment slot. Slot end times are determined by taking
   * the slot start time and adding the appointment's duration. As a result, it's
   * possible (indeed likely) for slots returned from the API to overlap. For
   * example, if your appointment type has a 15 minute slot interval and a 30 minute
   * duration, your slots will be 10:00-10:30, 10:15-10:45, 10:30-11:00, and so on.
   */
  end_at: string
  /**
   * The preferred user to meet with if this slot is chosen. Source automatically
   * determines a preferred user for each slot based on the routing preferences
   * provided when looking up appointment slots.
   */
  preferred: Expandable<User>
  /**
   * The list of all possible users who are available during this appointment slot,
   * including the preferred user. We will only return users in this list if they are
   * able to serve the provided appointment type, are available according to their
   * availability, and have no conflicting appointments.
   */
  available: Array<Expandable<User>>
}

export interface SlotListResponse {
  /**
   * The list of all slots that were returned for your availability query. Slots will
   * only be returned if at least one participant is available.
   */
  slots: Array<Slot>
  /**
   * The list of all possible users who were considered during the availability
   * query. When using groups in participant inclusion and exclusion criteria, it is
   * often useful to know the list of possible users who were searched for
   * availability. You can use this to create a booking interface that shows your
   * team's photos or includes more information about each of them.
   *
   * Source guarantees that availability slots will not be returned for users who are
   * not present in this list, and that the list shown here is reflective of the
   * order that each user was considered when selecting a preferred user for each
   * time slot.
   */
  participants: Array<Expandable<User>>
}

export type SlotListParamsParticipant = string
export type SlotListParamsExcludeParticipant = string
export type SlotListParamsRoutingStrategy =
  | 'care_team_required'
  | 'care_team_preferred'
  | 'care_team_hybrid'
  | 'round_robin'

export interface SlotListParams {
  /**
   * The appointment type to search. You may provide either the appointment types ID
   * or key. Note that the appointment type must be flagged as bookable in order for
   * the available slots API to succeed.
   */
  appointment_type: string
  /**
   * The member for whom the appointment is being booked. The member may influence
   * the results of this endpoint, depending on the routing choice selected below.
   *
   * When calling this endpoint as a member (using a member token), the member is
   * inferred and need not be provided. If it is provided, it must be the same as the
   * currently authenticated member.
   */
  member?: string
  /**
   * The start time for the availability search. You may provide a fully qualified
   * timestamp at any point throughout the day. Note that Source always begins
   * computing slots at midnight, so the first available slot may not align with the
   * start_at timestamp you provide, even if a user is available.
   */
  start_at: string
  /**
   * The end time for the availability search. Must be after the start time. Source
   * will not return any time slots that start after this time, however it's possible
   * that a time slot may end after this time.
   */
  end_at: string
  /**
   * By default, slots are formatted in UTC time. Providing another time zone here
   * has two effects:
   *
   * - The slots returned from the API will be formatted in this time zone. This
   * differs from most other endpoints, which   always return times in UTC. - Source
   * will automatically strip out overlapping times in that zone due to daylight
   * savings. For example, when the   clock rolls back in November in
   * America/New_York, your bookable slots will be 2am, 2:30am, 3am, 3:30am (2am
   * happens   twice on this day, but Source will skip the second instance of it and
   * all other overlapping times.)
   */
  output_time_zone?: string
  /**
   * Provide a set of users and groups that should be included in the response. The
   * users and groups included in this parameter must still be included in the
   * appointment type's configuration in order for the availability API to return
   * slots for them.
   *
   * For example, if your appointment type is linked to the group "Physicians," and
   * when calling this API you provide an include parameter for the group "Nurses,"
   * you will only receive available slots for users who are in both the Physicians
   * and Nurses group.
   *
   * You can use this capability to enforce state licensing requirements when booking
   * visits. Place each physician in a group called Physicians, as well as one group
   * for each state in which they are licensed, such as "New York." Then, link your
   * intake visit appointment type to the "Physicians" group. Finally, when
   * onboarding a new member, provide an include parameter to the slots API
   * specifying your "New York" group and you'll see combined availability for all of
   * your New York physicians.
   */
  participants?: Array<SlotListParamsParticipant>
  /**
   * Provide a set of users and groups that should be explicitly excluded from
   * availability lookups. This can be used to ensure a particular user (or group of
   * users) will not be returned from this API. You may want to use this if a member
   * is requesting to change physicians, and you want to ensure that they're not
   * inadvertently booked with their same physician again.
   *
   * Note that if both include and exclude are provided, exclude takes precedence.
   * Source guarantees that users provided in the exclude parameter will never appear
   * in the slot results.
   */
  exclude_participants?: Array<SlotListParamsExcludeParticipant>
  /**
   * Overrides the routing strategy configured on the appointment type. For more
   * information about the available routing strategies and how they work, see the
   * [Appointment Type](/docs/api/reference/appointment-type/) documentation.
   */
  routing_strategy?: SlotListParamsRoutingStrategy
  /**
   * Identifier of the appointment that is being rescheduled. When provided, Source
   * makes a few changes to availability calculation:
   *
   * - Source assumes the duration of the appointment should remain the same, and
   * thus will look for slots matching the appointment's current   duration, rather
   * than the appointment type's duration (which is the default behavior). - Source
   * will ignore the appointment when looking for conflicts, allowing you to rebook
   * the same slot or a slot which overlaps with the   appointment's current time
   * window.
   *
   * You should only provide rescheduling_appointment when you intend to update an
   * existing appointment, rather than to book a new appointment.
   */
  rescheduling_appointment?: string
  /**
   * The duration of the appointment to book, in minutes. By default, Source will use
   * either the appointment type's duration or, if provided, the rescheduling
   * appointment's duration. However, you may specify an alternative duration here to
   * calculate slots for an appointment of a different length.
   *
   * Must be a number between 5 and 360 minutes (6 hours).
   */
  duration?: number
}

export class SlotResource extends Resource {
  /**
   * This endpoint lists all bookable appointments slots for a set of users, given a
   * list of participants to include and a list of participants to exclude.
   *
   * This endpoint is accessible using member tokens, allowing your patient portal to
   * query the Source API for availability directly.
   *
   * Availability queries can only look at a maximum window of 31 days (a complete
   * calendar month). If you need to look at availability windows greater than 31
   * days, please reach out to our team.
   */
  public list(params: SlotListParams, options?: SourceRequestOptions): Promise<SlotListResponse> {
    return this.source.request('GET', '/v1/scheduling/slots', {
      query: params,
      options,
    })
  }
}
