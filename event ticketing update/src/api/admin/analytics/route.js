async function handler({ startDate, endDate, category }) {
  const session = getSession();

  if (!session) {
    return { error: "Authentication required" };
  }

  const userRole = await sql`
    SELECT role_type FROM user_roles 
    WHERE user_id = ${session.user.id} AND is_active = true
  `;

  if (
    !userRole.length ||
    !["admin", "super_admin"].includes(userRole[0].role_type)
  ) {
    return { error: "Admin access required" };
  }

  let dateFilter = "";
  let categoryFilter = "";
  const params = [];
  let paramCount = 0;

  if (startDate) {
    paramCount++;
    dateFilter += ` AND sale_date >= $${paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    dateFilter += ` AND sale_date <= $${paramCount}`;
    params.push(endDate);
  }

  if (category) {
    paramCount++;
    categoryFilter = ` AND category_name = $${paramCount}`;
    params.push(category);
  }

  const totalSalesQuery = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(ticket_quantity) as total_tickets_sold,
      SUM(total_amount) as total_revenue,
      SUM(commission_amount) as total_commission,
      SUM(net_amount) as total_net_revenue
    FROM sales_tracking 
    WHERE status = 'completed' ${dateFilter} ${categoryFilter}
  `;

  const categoryBreakdownQuery = `
    SELECT 
      category_name,
      COUNT(*) as orders_count,
      SUM(ticket_quantity) as tickets_sold,
      SUM(total_amount) as revenue,
      SUM(commission_amount) as commission,
      SUM(net_amount) as net_revenue,
      AVG(unit_price) as avg_ticket_price
    FROM sales_tracking 
    WHERE status = 'completed' ${dateFilter} ${categoryFilter}
    GROUP BY category_name
    ORDER BY revenue DESC
  `;

  const dailySummaryQuery = `
    SELECT 
      DATE(sale_date) as sale_day,
      SUM(ticket_quantity) as daily_tickets,
      SUM(total_amount) as daily_revenue,
      SUM(commission_amount) as daily_commission,
      COUNT(DISTINCT event_id) as events_sold
    FROM sales_tracking 
    WHERE status = 'completed' ${dateFilter} ${categoryFilter}
    GROUP BY DATE(sale_date)
    ORDER BY sale_day DESC
    LIMIT 30
  `;

  const monthlySummaryQuery = `
    SELECT 
      DATE_TRUNC('month', sale_date) as sale_month,
      SUM(ticket_quantity) as monthly_tickets,
      SUM(total_amount) as monthly_revenue,
      SUM(commission_amount) as monthly_commission,
      COUNT(DISTINCT event_id) as events_sold
    FROM sales_tracking 
    WHERE status = 'completed' ${dateFilter} ${categoryFilter}
    GROUP BY DATE_TRUNC('month', sale_date)
    ORDER BY sale_month DESC
    LIMIT 12
  `;

  const topEventsQuery = `
    SELECT 
      e.id,
      e.title,
      e.category,
      e.venue,
      e.event_date,
      SUM(st.ticket_quantity) as tickets_sold,
      SUM(st.total_amount) as event_revenue,
      SUM(st.commission_amount) as event_commission,
      e.total_tickets,
      e.available_tickets,
      ROUND((SUM(st.ticket_quantity)::numeric / e.total_tickets * 100), 2) as sold_percentage
    FROM sales_tracking st
    JOIN events e ON st.event_id = e.id
    WHERE st.status = 'completed' ${dateFilter} ${categoryFilter}
    GROUP BY e.id, e.title, e.category, e.venue, e.event_date, e.total_tickets, e.available_tickets
    ORDER BY event_revenue DESC
    LIMIT 20
  `;

  const remainingTicketsQuery = `
    SELECT 
      e.id,
      e.title,
      e.category,
      e.venue,
      e.event_date,
      e.total_tickets,
      e.available_tickets,
      e.ticket_price,
      (e.total_tickets - e.available_tickets) as tickets_sold,
      ROUND(((e.total_tickets - e.available_tickets)::numeric / e.total_tickets * 100), 2) as sold_percentage,
      (e.available_tickets * e.ticket_price) as potential_revenue
    FROM events e
    WHERE e.status = 'approved' AND e.event_date > NOW() ${
      category ? "AND e.category = $" + paramCount : ""
    }
    ORDER BY e.event_date ASC
  `;

  const [
    totalSales,
    categoryBreakdown,
    dailySummary,
    monthlySummary,
    topEvents,
    remainingTickets,
  ] = await sql.transaction([
    sql(totalSalesQuery, params),
    sql(categoryBreakdownQuery, params),
    sql(dailySummaryQuery, params),
    sql(monthlySummaryQuery, params),
    sql(topEventsQuery, params),
    category
      ? sql(remainingTicketsQuery, [...params])
      : sql(remainingTicketsQuery, []),
  ]);

  const categoriesWithMedia = await sql`
    SELECT name, image_url, media_type 
    FROM event_categories 
    ORDER BY name
  `;

  return {
    success: true,
    analytics: {
      overview: totalSales[0] || {
        total_orders: 0,
        total_tickets_sold: 0,
        total_revenue: 0,
        total_commission: 0,
        total_net_revenue: 0,
      },
      categoryBreakdown: categoryBreakdown || [],
      dailySummary: dailySummary || [],
      monthlySummary: monthlySummary || [],
      topEvents: topEvents || [],
      remainingTickets: remainingTickets || [],
      categories: categoriesWithMedia || [],
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        category: category || null,
      },
      generatedAt: new Date().toISOString(),
    },
  };
}
export async function POST(request) {
  return handler(await request.json());
}