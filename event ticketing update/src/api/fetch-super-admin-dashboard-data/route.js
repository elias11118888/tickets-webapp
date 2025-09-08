async function handler() {
  const session = getSession();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Authentication required",
    };
  }

  try {
    // Check if user is super_admin
    const roleCheck = await sql`
      SELECT role_type 
      FROM user_roles 
      WHERE user_id = ${session.user.id} 
      AND role_type = 'super_admin' 
      AND is_active = true
    `;

    if (!roleCheck.length) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // Run all queries in parallel using transaction
    const [eventsCount, revenueData, ticketsSold, adminActivities, salesData] =
      await sql.transaction([
        sql`
        SELECT COUNT(*) as total_events 
        FROM events
      `,

        sql`
        SELECT 
          COALESCE(SUM(total_revenue), 0) as total_revenue,
          COALESCE(SUM(total_commission), 0) as total_commission
        FROM revenue_summary
      `,

        sql`
        SELECT COALESCE(SUM(ticket_quantity), 0) as total_tickets
        FROM sales_tracking
      `,

        sql`
        SELECT 
          aal.id,
          aal.action_type,
          aal.target_type,
          aal.description,
          aal.created_at,
          au.name as admin_name
        FROM admin_activity_log aal
        LEFT JOIN auth_users au ON au.id = aal.admin_id
        ORDER BY aal.created_at DESC
        LIMIT 10
      `,

        sql`
        SELECT 
          DATE(sale_date) as date,
          SUM(total_amount) as daily_revenue,
          COUNT(DISTINCT ticket_order_id) as orders_count,
          SUM(ticket_quantity) as tickets_sold
        FROM sales_tracking
        WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(sale_date)
        ORDER BY date ASC
      `,
      ]);

    return {
      success: true,
      data: {
        totalEvents: eventsCount[0].total_events,
        revenue: {
          total: revenueData[0].total_revenue,
          commission: revenueData[0].total_commission,
        },
        totalTicketsSold: ticketsSold[0].total_tickets,
        recentActivities: adminActivities,
        salesTrends: salesData,
      },
    };
  } catch (error) {
    console.error("Super admin dashboard error:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard data",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}