async function handler({
  eventId,
  quantity,
  buyerName,
  buyerEmail,
  buyerPhone,
  paymentMethod,
  paymentDetails,
}) {
  const session = getSession();

  if (!eventId || !quantity || !buyerName || !buyerEmail || !paymentMethod) {
    return {
      success: false,
      error:
        "Missing required fields: eventId, quantity, buyerName, buyerEmail, paymentMethod",
    };
  }

  if (quantity <= 0) {
    return {
      success: false,
      error: "Quantity must be greater than 0",
    };
  }

  const validPaymentMethods = [
    "credit_card",
    "mobile_money",
    "paypal",
    "bank_transfer",
    "crypto",
  ];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return {
      success: false,
      error:
        "Invalid payment method. Must be credit_card, mobile_money, paypal, bank_transfer, or crypto",
    };
  }

  try {
    const event = await sql`
      SELECT id, title, category, available_tickets, ticket_price, status, event_date
      FROM events 
      WHERE id = ${eventId} AND status = 'approved'
    `;

    if (!event.length) {
      return {
        success: false,
        error: "Event not found or not available for booking",
      };
    }

    const eventData = event[0];

    if (new Date(eventData.event_date) <= new Date()) {
      return {
        success: false,
        error: "Cannot purchase tickets for past events",
      };
    }

    if (eventData.available_tickets < quantity) {
      return {
        success: false,
        error: `Only ${eventData.available_tickets} tickets available`,
      };
    }

    const totalAmount = parseFloat(eventData.ticket_price) * quantity;
    const commissionRate = 0.05; // 5% commission
    const commissionAmount = totalAmount * commissionRate;
    const netAmount = totalAmount - commissionAmount;
    const ticketNumber = `TKT-${eventId}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;

    const buyerId = session?.user?.id || null;

    const result = await sql.transaction([
      sql`
        INSERT INTO ticket_orders (
          event_id,
          buyer_id,
          buyer_name,
          buyer_email,
          buyer_phone,
          quantity,
          total_amount,
          payment_status,
          payment_method,
          ticket_number,
          created_at
        ) VALUES (
          ${eventId},
          ${buyerId},
          ${buyerName},
          ${buyerEmail},
          ${buyerPhone || null},
          ${quantity},
          ${totalAmount},
          'completed',
          ${paymentMethod},
          ${ticketNumber},
          CURRENT_TIMESTAMP
        )
        RETURNING id, ticket_number, total_amount, created_at
      `,
      sql`
        UPDATE events 
        SET available_tickets = available_tickets - ${quantity},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${eventId}
        RETURNING available_tickets
      `,
      sql`
        INSERT INTO sales_tracking (
          ticket_order_id,
          event_id,
          category_name,
          ticket_quantity,
          unit_price,
          total_amount,
          commission_rate,
          commission_amount,
          net_amount,
          processed_by,
          status
        ) VALUES (
          (SELECT id FROM ticket_orders WHERE ticket_number = ${ticketNumber}),
          ${eventId},
          ${eventData.category},
          ${quantity},
          ${eventData.ticket_price},
          ${totalAmount},
          ${commissionRate},
          ${commissionAmount},
          ${netAmount},
          ${buyerId},
          'completed'
        )
      `,
      sql`
        INSERT INTO admin_activity_log (
          admin_id,
          action_type,
          target_type,
          target_id,
          description,
          metadata
        ) VALUES (
          ${buyerId},
          'ticket_purchase',
          'ticket_order',
          (SELECT id FROM ticket_orders WHERE ticket_number = ${ticketNumber}),
          'Ticket purchase completed',
          ${JSON.stringify({
            eventId,
            eventTitle: eventData.title,
            category: eventData.category,
            quantity,
            totalAmount,
            paymentMethod,
            buyerEmail,
          })}
        )
      `,
    ]);

    const orderData = result[0][0];
    const updatedEvent = result[1][0];

    // Send purchase confirmation email
    try {
      await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ticket_purchase",
          recipient_email: buyerEmail,
          recipient_name: buyerName,
          event_id: eventId,
          order_id: orderData.id,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the purchase if email fails
    }

    return {
      success: true,
      message: "Tickets purchased successfully",
      order: {
        id: orderData.id,
        ticketNumber: orderData.ticket_number,
        eventTitle: eventData.title,
        quantity: quantity,
        totalAmount: orderData.total_amount,
        paymentMethod: paymentMethod,
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        purchaseDate: orderData.created_at,
      },
      event: {
        id: eventId,
        remainingTickets: updatedEvent.available_tickets,
      },
    };
  } catch (error) {
    console.error("Error processing ticket purchase:", error);

    if (
      error.message &&
      error.message.includes("ticket_orders_ticket_number_key")
    ) {
      return {
        success: false,
        error: "Ticket generation failed, please try again",
      };
    }

    return {
      success: false,
      error: "Failed to process ticket purchase",
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}