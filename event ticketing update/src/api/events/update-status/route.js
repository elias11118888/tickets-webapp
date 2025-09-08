async function handler({ eventId, status }) {
  const session = getSession();

  if (!session || !session.user) {
    return {
      success: false,
      error: "Authentication required",
    };
  }

  const userRole = await sql`
    SELECT role_type 
    FROM user_roles 
    WHERE user_id = ${session.user.id}
  `;

  if (!userRole.length || userRole[0].role_type !== "admin") {
    return {
      success: false,
      error: "Admin access required",
    };
  }

  if (!eventId || !status) {
    return {
      success: false,
      error: "Event ID and status are required",
    };
  }

  const validStatuses = ["pending", "approved", "rejected", "cancelled"];
  if (!validStatuses.includes(status)) {
    return {
      success: false,
      error:
        "Invalid status. Must be one of: pending, approved, rejected, cancelled",
    };
  }

  try {
    const existingEvent = await sql`
      SELECT id, title, status 
      FROM events 
      WHERE id = ${eventId}
    `;

    if (!existingEvent.length) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    const updatedEvent = await sql`
      UPDATE events 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${eventId}
      RETURNING id, title, status, updated_at
    `;

    return {
      success: true,
      message: `Event status updated to ${status}`,
      event: updatedEvent[0],
    };
  } catch (error) {
    console.error("Error updating event status:", error);
    return {
      success: false,
      error: "Failed to update event status",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}