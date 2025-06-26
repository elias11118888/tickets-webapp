async function handler() {
  try {
    const categories = await sql`
      SELECT id, name, description, image_url, media_type, created_at
      FROM event_categories
      ORDER BY name ASC
    `;

    return {
      success: true,
      categories: categories,
      count: categories.length,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
      categories: [],
      count: 0,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}