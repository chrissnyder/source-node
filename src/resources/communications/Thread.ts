import { Resource } from '../../BaseResource'
import { SourceRequestOptions } from '../../SourceClient'
import { File } from '../File'
import { Member } from '../Member'
import { ThreadStatus } from '../ThreadStatus'
import { User } from '../User'
import { Expandable } from '../shared'

export type ThreadLastMessageAttachmentType = 'file' | 'link'

export interface ThreadLastMessageAttachment {
  /**
   * The type of attachment. Currently, the only supported attachment types are
   * `file` and `link`, but other attachment types may be added.
   */
  type: ThreadLastMessageAttachmentType
  /**
   * A description of the attachment. If a file uploaded to Source is attached, the
   * file's name is displayed. Otherwise, this description is displayed.
   */
  description: string | null
  /**
   * The URL where the attachment's contents can be accessed. For link attachments,
   * the link to redirect. For file attachments, the URL returned by Source is a link
   * to the file.
   */
  url: string
  /**
   * The resource which is attached to the message
   */
  resource: Expandable<File> | null
  /**
   * A map of your own metadata to be included alongside this attachment. For
   * example, you can use this metadata for bookkeeping or rendering in your member
   * experience.
   *
   * Metadata may only be set when calling the API with your API keys. It cannot be
   * set when using member tokens.
   */
  metadata: Record<string, unknown>
}

export interface ThreadLastMessage {
  /**
   * Plain text contents of the message.
   */
  text: string
  /**
   * Any attachments to the message, such as files and links.
   */
  attachments: Array<ThreadLastMessageAttachment>
  /**
   * The person who sent this message.
   */
  sender: Expandable<User | Member>
  /**
   * The time at which this message was sent.
   */
  sent_at: string
  /**
   * The time at which this message redacted.
   */
  redacted_at: string | null
}

export interface Thread {
  /**
   * Always `thread`.
   */
  object: 'thread'
  /**
   * Unique ID of the thread.
   */
  id: string
  /**
   * The member to which this thread belongs.
   */
  member: Expandable<Member>
  /**
   * The user who is assigned to the thread and will be notified of new messages.
   */
  assignee: Expandable<User> | null
  /**
   * Current status of the thread.
   */
  status: ThreadStatus
  /**
   * Subject of the thread.
   */
  subject: string | null
  /**
   * Preview of the most recent text message in the thread.
   */
  last_message: ThreadLastMessage
  /**
   * Timestamp of when the thread was created.
   */
  created_at: string
  /**
   * Timestamp of when the thread was last updated.
   */
  updated_at: string
  /**
   * Timestamp of when the thread was last closed.
   */
  closed_at: string | null
  /**
   * Timestamp indicating the point through which the member has read. All messages
   * with a `sent_at` after this point are considered unread. If null, the member has
   * not seen any messages on this thread.
   */
  member_last_read: string | null
  /**
   * Timestamp of the last message that was sent on this thread. This message has
   * been read by the member if the last_read timestamp is greater than or equal to
   * the last_message_at timestamp
   */
  last_message_at: string
}

export interface ThreadListResponse {
  /**
   * Always `list`.
   */
  object: 'list'
  /**
   * Array of results
   */
  data: Array<Thread>
  /**
   * Contains `true` if there is another page of results available.
   */
  has_more: boolean
}

export interface ThreadListParams {
  /**
   * A cursor for use in pagination. `ending_before` is an object ID that defines
   * your place in the list. For instance, if you make a list request and receive 100
   * objects, starting with obj_bar, your subsequent call can include
   * ending_before=obj_bar in order to fetch the previous page of the list.
   */
  ending_before?: string
  /**
   * A cursor for use in pagination. `starting_after` is an object ID that defines
   * your place in the list. For instance, if you make a list request and receive 100
   * objects, ending with obj_foo, your subsequent call can include
   * starting_after=obj_foo in order to fetch the next page of the list.
   */
  starting_after?: string
  /**
   * A limit on the number of objects to be returned. Limit can range between 1 and
   * 100.
   */
  limit?: number
  /**
   * Filter threads to only those belonging to the given member.
   */
  member?: string
  /**
   * Filter threads to only those assigned to the given user. The value `current` may
   * be used to indicate the currently authenticated user.
   */
  assignee?: string
  /**
   * Filter threads by status
   */
  status?: Array<ThreadStatus>
}

export type ThreadCreateParamsMessageThreadActionsStatus =
  | 'awaiting_care_team'
  | 'awaiting_member'
  | 'closed'

export interface ThreadCreateParamsMessageThreadActions {
  /**
   * New status for the thread after sending this message. By default, Source will
   * set the thread status to 'awaiting_care_team' if the member sends the message,
   * and 'awaiting_member' if someone on the care team send the message.
   */
  status?: ThreadCreateParamsMessageThreadActionsStatus
}

export type ThreadCreateParamsMessageAttachmentType = 'file' | 'link'

export interface ThreadCreateParamsMessageAttachment {
  /**
   * The type of attachment. Currently, the supported attachment types are `file` and
   * `link`. If set to file, then a resource must be provided. If set to link, then a
   * URL must be provided. Other attachment types may be added in the future.
   */
  type: ThreadCreateParamsMessageAttachmentType
  /**
   * A description of the attachment to display. If a file uploaded to Source is
   * attached, the file's name overrides a description and is displayed. Otherwise,
   * this description is displayed.
   */
  description?: string | null
  /**
   * Unique ID of the resource to be attached to this message. When attaching a file,
   * this should be set to the uploaded file's ID.
   */
  resource?: string
  /**
   * The URL where the attachment's contents can be accessed. For link attachments,
   * the link to redirect. For file attachments, the URL returned by Source is a link
   * to the file.
   */
  url?: string
  /**
   * A map of your own metadata to be included alongside this attachment. For
   * example, you can use this metadata for bookkeeping or rendering in your member
   * experience.
   *
   * Metadata may only be set when calling the API with your API keys. It cannot be
   * set when using member tokens.
   */
  metadata?: Record<string, unknown>
}

export type ThreadCreateParamsMessageSender = string

export interface ThreadCreateParamsMessage {
  /**
   * Contents of the message to send.
   */
  text: string
  /**
   * Actions to apply to the thread after the message has been sent. Source
   * guarantees that these actions will only be applied if the message has been
   * successfully sent. See the documentation for nested params for information about
   * each available action.
   */
  thread_actions?: ThreadCreateParamsMessageThreadActions
  attachments?: Array<ThreadCreateParamsMessageAttachment>
  /**
   * When calling this endpoint with an API key, you must use this field to specify
   * the user or member on whose behalf the message is sent.
   */
  sender?: ThreadCreateParamsMessageSender
  /**
   * The time at which this message was sent. When calling this endpoint with an API
   * key you can optionally specify the sent_at time, such as when backloading
   * historical messages. By default and when called as a user or a member, the
   * current time is used.
   */
  sent_at?: string
}

export interface ThreadCreateParams {
  /**
   * The ID of the member to which this thread belongs
   */
  member: string
  /**
   * The user who is assigned to the thread and who will be notified of new messages
   * via a task.
   */
  assignee?: string
  /**
   * The thread subject.
   */
  subject?: string | null
  /**
   * The initial message to send when creating this thread.
   */
  message: ThreadCreateParamsMessage
}

export type ThreadUpdateParamsStatus = 'awaiting_care_team' | 'awaiting_member' | 'closed'

export interface ThreadUpdateParams {
  /**
   * The user who is assigned to the thread and who will be notified of new messages
   * via a task.
   */
  assignee?: string | null
  /**
   * New status for the thread.
   */
  status?: ThreadUpdateParamsStatus
  /**
   * New subject for the thread.
   */
  subject?: string | null
}

export interface ThreadMarkParams {
  /**
   * Timestamp indicating the point through which the member has read. All messages
   * with a `sent_at` after this point are considered unread. If null, the member has
   * not seen any messages on this thread.
   */
  member_last_read: string | null
}

export class ThreadResource extends Resource {
  /**
   * Returns a list of threads within the current account.
   *
   * The threads returned are sorted with the most recently updated appearing first.
   */
  public list(
    params?: ThreadListParams,
    options?: SourceRequestOptions,
  ): Promise<ThreadListResponse> {
    return this.source.request('GET', '/v1/communication/threads', {
      query: params,
      options,
    })
  }

  /**
   * Creates a new messaging thread.
   */
  public create(params: ThreadCreateParams, options?: SourceRequestOptions): Promise<Thread> {
    return this.source.request('POST', '/v1/communication/threads', {
      data: params,
      contentType: 'json',
      options,
    })
  }

  /**
   * Retrieves the details of an existing thread. You need only supply the unique
   * thread identifier that was returned upon creation.
   */
  public retrieve(id: string, options?: SourceRequestOptions): Promise<Thread> {
    return this.source.request('GET', `/v1/communication/threads/${id}`, {
      options,
    })
  }

  /**
   * Updates the specified thread by setting the values of the parameters passed. Any
   * parameters not provided will be left unchanged.
   *
   * You can change the thread’s status or subject or reassign the thread to a
   * different user.
   */
  public update(
    id: string,
    params?: ThreadUpdateParams,
    options?: SourceRequestOptions,
  ): Promise<Thread> {
    return this.source.request('POST', `/v1/communication/threads/${id}`, {
      data: params,
      contentType: 'json',
      options,
    })
  }

  /**
   * Marks a thread as read by the member. You can provide a timestamp through which
   * the member has read. All message appearing before this timestamp will be shown
   * as read by the member in the Source Elements SDK. If you're not using Elements,
   * you can use this timestamp to track where the member has read in your own
   * interface.
   *
   * Providing null marks the entire thread as unread.
   */
  public mark(
    id: string,
    params: ThreadMarkParams,
    options?: SourceRequestOptions,
  ): Promise<Thread> {
    return this.source.request('POST', `/v1/communication/threads/${id}/mark`, {
      data: params,
      contentType: 'json',
      options,
    })
  }
}
