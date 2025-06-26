async function handler({
  title,
  description,
  category,
  event_date,
  venue,
  ticket_price,
  total_tickets,
  image_url,
}) {
  const session = getSession();

  if (!session || !session.user) {
    return {
      success: false,
      error: "Authentication required",
    };
  }

  if (
    !title ||
    !description ||
    !category ||
    !event_date ||
    !venue ||
    !ticket_price ||
    !total_tickets
  ) {
    return {
      success: false,
      error: "All required fields must be provided",
    };
  }

  if (total_tickets <= 0) {
    return {
      success: false,
      error: "Total tickets must be greater than 0",
    };
  }

  if (ticket_price < 0) {
    return {
      success: false,
      error: "Ticket price cannot be negative",
    };
  }

  const eventDate = new Date(event_date);
  if (eventDate <= new Date()) {
    return {
      success: false,
      error: "Event date must be in the future",
    };
  }

  try {
    const result = await sql`
      INSERT INTO events (
        title, 
        description, 
        category, 
        event_date, 
        venue, 
        image_url,
        total_tickets, 
        available_tickets, 
        ticket_price, 
        status, 
        created_by,
        created_at,
        updated_at
      ) VALUES (
        ${title},
        ${description},
        ${category},
        ${event_date},
        ${venue},
        ${image_url || null},
        ${total_tickets},
        ${total_tickets},
        ${ticket_price},
        'pending',
        ${session.user.id},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING id, title, status
    `;

    return {
      success: true,
      message: "Event created successfully and is pending admin approval",
      event: result[0],
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error: "Failed to create event",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}