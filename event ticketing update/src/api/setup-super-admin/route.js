async function handler({
  action,
  userId,
  name,
  email,
  password,
  forceOverride,
}) {
  try {
    console.log("Setup Super Admin API called with:", {
      action,
      userId,
      name,
      email,
      forceOverride,
    });

    if (action === "check") {
      // Check if there's already a super admin
      const existingSuperAdmin = await sql`
        SELECT u.id, u.name, u.email 
        FROM auth_users u
        JOIN user_roles ur ON u.id = ur.user_id
        WHERE ur.role_type = 'super_admin' AND ur.is_active = true
        LIMIT 1
      `;

      return {
        hasSuperAdmin: existingSuperAdmin.length > 0,
        existingSuperAdmin:
          existingSuperAdmin.length > 0 ? existingSuperAdmin[0] : null,
      };
    }

    if (action === "promote") {
      // Promote existing user to super admin
      if (!userId || !name || !email) {
        return { error: "User ID, name, and email are required for promotion" };
      }

      // Check if user exists
      const existingUser = await sql`
        SELECT id, name, email FROM auth_users WHERE id = ${userId}
      `;

      if (existingUser.length === 0) {
        return { error: "User not found" };
      }

      // Check if there's already a super admin (unless forcing override)
      const existingSuperAdmin = await sql`
        SELECT u.id, u.name, u.email 
        FROM auth_users u
        JOIN user_roles ur ON u.id = ur.user_id
        WHERE ur.role_type = 'super_admin' AND ur.is_active = true
        LIMIT 1
      `;

      if (existingSuperAdmin.length > 0) {
        return { error: "A super administrator already exists in the system" };
      }

      // Create super admin role for the user
      await sql`
        INSERT INTO user_roles (user_id, role_type, is_active, created_at)
        VALUES (${userId}, 'super_admin', true, NOW())
      `;

      console.log("Successfully promoted user to super admin:", {
        userId,
        name,
        email,
      });

      return {
        success: true,
        message: "User successfully promoted to super administrator",
        user: { id: userId, name, email },
      };
    }

    if (action === "create") {
      // Original create super admin logic
      if (!name || !email || !password) {
        return { error: "Name, email, and password are required" };
      }

      // Check if there's already a super admin (unless forcing override)
      const existingSuperAdmin = await sql`
        SELECT u.id, u.name, u.email 
        FROM auth_users u
        JOIN user_roles ur ON u.id = ur.user_id
        WHERE ur.role_type = 'super_admin' AND ur.is_active = true
        LIMIT 1
      `;

      if (existingSuperAdmin.length > 0 && !forceOverride) {
        return { error: "A super administrator already exists in the system" };
      }

      // If forcing override, deactivate existing super admin
      if (existingSuperAdmin.length > 0 && forceOverride) {
        console.log("Deactivating existing super admin due to override");
        await sql`
          UPDATE user_roles 
          SET is_active = false 
          WHERE role_type = 'super_admin' AND is_active = true
        `;
      }

      // Check if user with this email already exists
      const existingUser = await sql`
        SELECT id FROM auth_users WHERE email = ${email}
      `;

      let userId;
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
        // Update existing user's name if provided
        await sql`
          UPDATE auth_users 
          SET name = ${name}
          WHERE id = ${userId}
        `;
      } else {
        // Create new user
        const newUser = await sql`
          INSERT INTO auth_users (name, email, "emailVerified")
          VALUES (${name}, ${email}, NOW())
          RETURNING id
        `;
        userId = newUser[0].id;
      }

      // Create or update account with password
      await sql`
        INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
        VALUES (${userId}, 'credentials', 'credentials', ${email}, ${password})
        ON CONFLICT ("userId", provider) 
        DO UPDATE SET password = EXCLUDED.password
      `;

      // Create super admin role
      await sql`
        INSERT INTO user_roles (user_id, role_type, is_active, created_at)
        VALUES (${userId}, 'super_admin', true, NOW())
        ON CONFLICT (user_id, role_type) 
        DO UPDATE SET is_active = true
      `;

      console.log("Successfully created super admin:", { userId, name, email });

      return {
        success: true,
        message: "Super administrator created successfully",
        user: { id: userId, name, email },
      };
    }

    return { error: "Invalid action specified" };
  } catch (error) {
    console.error("Error in setup-super-admin:", error);
    return { error: `Setup failed: ${error.message}` };
  }
}
export async function POST(request) {
  return handler(await request.json());
}