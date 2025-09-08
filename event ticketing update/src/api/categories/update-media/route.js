async function handler({ categoryId, mediaUrl, mediaType }) {
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

  if (!categoryId) {
    return {
      success: false,
      error: "Category ID is required",
    };
  }

  if (!mediaUrl) {
    return {
      success: false,
      error: "Media URL is required",
    };
  }

  if (!mediaType || !["image", "video"].includes(mediaType)) {
    return {
      success: false,
      error: "Media type must be either 'image' or 'video'",
    };
  }

  try {
    const existingCategory = await sql`
      SELECT id, name 
      FROM event_categories 
      WHERE id = ${categoryId}
    `;

    if (!existingCategory.length) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    const updatedCategory = await sql`
      UPDATE event_categories 
      SET image_url = ${mediaUrl}, media_type = ${mediaType}
      WHERE id = ${categoryId}
      RETURNING id, name, description, image_url, media_type, created_at
    `;

    return {
      success: true,
      message: "Category media updated successfully",
      category: updatedCategory[0],
    };
  } catch (error) {
    console.error("Error updating category media:", error);
    return {
      success: false,
      error: "Failed to update category media",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}