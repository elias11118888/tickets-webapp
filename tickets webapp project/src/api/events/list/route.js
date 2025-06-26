async function handler({ category, status, limit, offset }) {
  try {
    let queryString = `
      SELECT 
        id,
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
      FROM events 
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      queryString += ` AND category = $${paramCount}`;
      values.push(category);
    }

    if (status) {
      paramCount++;
      queryString += ` AND status = $${paramCount}`;
      values.push(status);
    }

    queryString += ` ORDER BY event_date ASC`;

    if (limit) {
      paramCount++;
      queryString += ` LIMIT $${paramCount}`;
      values.push(limit);
    }

    if (offset) {
      paramCount++;
      queryString += ` OFFSET $${paramCount}`;
      values.push(offset);
    }

    const events = await sql(queryString, values);

    return {
      success: true,
      events: events,
      count: events.length,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      success: false,
      error: "Failed to fetch events",
      events: [],
      count: 0,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}