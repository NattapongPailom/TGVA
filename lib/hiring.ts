/**
 * Which open post is hiring, kept out of the client components so the Staff
 * block, a server component, can ask too: a plain function exported from a
 * "use client" file cannot be called on the server.
 */

/** The hiring pass's id, which the Staff block's "Go to the open seat" scrolls to. */
export const hiringSeatId = "open-seat";

/** An open post recruiting through a form of its own. See `team` in content/site. */
export const isHiring = (member: { name: string | null; applyUrl?: string }) =>
  !member.name && Boolean(member.applyUrl);
