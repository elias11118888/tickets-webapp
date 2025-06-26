async function handler({ startDate, endDate, eventId, period = "30" }) {
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

  try {
    let dateFilter = "";
    let eventFilter = "";
    const values = [];
    let paramCount = 0;

    if (startDate && endDate) {
      paramCount += 2;
      dateFilter = ` AND to.created_at >= $${
        paramCount - 1
      } AND to.created_at <= $${paramCount}`;
      values.push(startDate, endDate);
    } else {
      paramCount += 1;
      dateFilter = ` AND to.created_at >= NOW() - INTERVAL '${period} days'`;
    }

    if (eventId) {
      paramCount += 1;
      eventFilter = ` AND to.event_id = $${paramCount}`;
      values.push(eventId);
    }

    const revenueQuery = `
      SELECT 
        COALESCE(SUM(to.total_amount), 0) as total_revenue,
        COUNT(to.id) as total_orders,
        COALESCE(SUM(to.quantity), 0) as total_tickets_sold,
        COALESCE(AVG(to.total_amount), 0) as average_order_value
      FROM ticket_orders to
      WHERE to.payment_status = 'completed'
      ${dateFilter}
      ${eventFilter}
    `;

    const paymentMethodQuery = `
      SELECT 
        COALESCE(to.payment_method, 'Unknown') as payment_method,
        COUNT(to.id) as order_count,
        COALESCE(SUM(to.total_amount), 0) as revenue
      FROM ticket_orders to
      WHERE to.payment_status = 'completed'
      ${dateFilter}
      ${eventFilter}
      GROUP BY to.payment_method
      ORDER BY revenue DESC
    `;

    const topEventsQuery = `
      SELECT 
        e.id,
        e.title,
        e.category,
        e.event_date,
        e.venue,
        COUNT(to.id) as total_orders,
        COALESCE(SUM(to.quantity), 0) as tickets_sold,
        COALESCE(SUM(to.total_amount), 0) as revenue,
        e.total_tickets,
        ROUND((COALESCE(SUM(to.quantity), 0)::numeric / e.total_tickets) * 100, 2) as sold_percentage
      FROM events e
      LEFT JOIN ticket_orders to ON e.id = to.event_id AND to.payment_status = 'completed'
      WHERE e.status = 'approved'
      ${eventFilter.replace("to.event_id", "e.id")}
      GROUP BY e.id, e.title, e.category, e.event_date, e.venue, e.total_tickets
      ORDER BY revenue DESC
      LIMIT 10
    `;

    const recentOrdersQuery = `
      SELECT 
        to.id,
        to.buyer_name,
        to.buyer_email,
        to.quantity,
        to.total_amount,
        to.payment_method,
        to.ticket_number,
        to.created_at,
        e.title as event_title,
        e.event_date
      FROM ticket_orders to
      JOIN events e ON to.event_id = e.id
      WHERE to.payment_status = 'completed'
      ${dateFilter}
      ${eventFilter}
      ORDER BY to.created_at DESC
      LIMIT 20
    `;

    const dailyRevenueQuery = `
      SELECT 
        DATE(to.created_at) as date,
        COALESCE(SUM(to.total_amount), 0) as revenue,
        COUNT(to.id) as orders,
        COALESCE(SUM(to.quantity), 0) as tickets
      FROM ticket_orders to
      WHERE to.payment_status = 'completed'
      ${dateFilter}
      ${eventFilter}
      GROUP BY DATE(to.created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const categoryPerformanceQuery = `
      SELECT 
        e.category,
        COUNT(DISTINCT e.id) as event_count,
        COUNT(to.id) as total_orders,
        COALESCE(SUM(to.quantity), 0) as tickets_sold,
        COALESCE(SUM(to.total_amount), 0) as revenue,
        COALESCE(AVG(to.total_amount), 0) as avg_order_value
      FROM events e
      LEFT JOIN ticket_orders to ON e.id = to.event_id AND to.payment_status = 'completed'
      WHERE e.status = 'approved'
      ${dateFilter.replace(
        "to.created_at",
        "COALESCE(to.created_at, e.created_at)"
      )}
      ${eventFilter.replace("to.event_id", "e.id")}
      GROUP BY e.category
      ORDER BY revenue DESC
    `;

    const [
      revenueData,
      paymentMethods,
      topEvents,
      recentOrders,
      dailyRevenue,
      categoryPerformance,
    ] = await sql.transaction([
      sql(revenueQuery, values),
      sql(paymentMethodQuery, values),
      sql(topEventsQuery, values),
      sql(recentOrdersQuery, values),
      sql(dailyRevenueQuery, values),
      sql(categoryPerformanceQuery, values),
    ]);

    const previousPeriodStart =
      startDate && endDate
        ? new Date(
            new Date(startDate).getTime() -
              (new Date(endDate).getTime() - new Date(startDate).getTime())
          )
        : new Date(Date.now() - parseInt(period) * 2 * 24 * 60 * 60 * 1000);

    const previousPeriodEnd = startDate
      ? new Date(startDate)
      : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const previousPeriodQuery = `
      SELECT 
        COALESCE(SUM(to.total_amount), 0) as revenue,
        COUNT(to.id) as orders,
        COALESCE(SUM(to.quantity), 0) as tickets
      FROM ticket_orders to
      WHERE to.payment_status = 'completed'
      AND to.created_at >= $1 AND to.created_at <= $2
      ${eventFilter}
    `;

    const previousPeriodValues = eventId
      ? [
          previousPeriodStart.toISOString(),
          previousPeriodEnd.toISOString(),
          eventId,
        ]
      : [previousPeriodStart.toISOString(), previousPeriodEnd.toISOString()];

    const previousPeriodData = await sql(
      previousPeriodQuery,
      previousPeriodValues
    );

    const currentRevenue = parseFloat(revenueData[0]?.total_revenue || 0);
    const previousRevenue = parseFloat(previousPeriodData[0]?.revenue || 0);
    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
        ? 100
        : 0;

    const currentOrders = parseInt(revenueData[0]?.total_orders || 0);
    const previousOrders = parseInt(previousPeriodData[0]?.orders || 0);
    const orderGrowth =
      previousOrders > 0
        ? ((currentOrders - previousOrders) / previousOrders) * 100
        : currentOrders > 0
        ? 100
        : 0;

    return {
      success: true,
      analytics: {
        summary: {
          total_revenue: currentRevenue,
          total_orders: currentOrders,
          total_tickets_sold: parseInt(revenueData[0]?.total_tickets_sold || 0),
          average_order_value: parseFloat(
            revenueData[0]?.average_order_value || 0
          ),
          revenue_growth: Math.round(revenueGrowth * 100) / 100,
          order_growth: Math.round(orderGrowth * 100) / 100,
        },
        payment_methods: paymentMethods,
        top_events: topEvents,
        recent_orders: recentOrders,
        daily_revenue: dailyRevenue.reverse(),
        category_performance: categoryPerformance,
        period: {
          start:
            startDate ||
            new Date(
              Date.now() - parseInt(period) * 24 * 60 * 60 * 1000
            ).toISOString(),
          end: endDate || new Date().toISOString(),
          days: period,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    return {
      success: false,
      error: "Failed to fetch sales analytics",
      analytics: null,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}