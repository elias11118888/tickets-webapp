async function handler({
  type,
  recipient_email,
  recipient_name,
  event_id,
  order_id,
  ticket_number,
  admin_message,
  paymentMethod,
}) {
  if (!type || !recipient_email) {
    return {
      success: false,
      error: "Email type and recipient email are required",
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
    let emailData = {};

    switch (type) {
      case "ticket_purchase":
        if (!event_id || !order_id) {
          return {
            success: false,
            error:
              "Event ID and order ID are required for ticket purchase emails",
          };
        }

        const [eventDetails, orderDetails] = await sql.transaction([
          sql`SELECT title, description, event_date, venue FROM events WHERE id = ${event_id}`,
          sql`SELECT quantity, total_amount, ticket_number, created_at FROM ticket_orders WHERE id = ${order_id}`,
        ]);

        if (!eventDetails.length || !orderDetails.length) {
          return {
            success: false,
            error: "Event or order not found",
          };
        }

        emailData = {
          subject: `Ticket Purchase Confirmation - ${eventDetails[0].title}`,
          html: generatePurchaseConfirmationHTML({
            recipient_name: recipient_name || "Customer",
            event: eventDetails[0],
            order: orderDetails[0],
          }),
        };
        break;

      case "event_reminder":
        if (!event_id) {
          return {
            success: false,
            error: "Event ID is required for reminder emails",
          };
        }

        const reminderEvent =
          await sql`SELECT title, event_date, venue FROM events WHERE id = ${event_id}`;

        if (!reminderEvent.length) {
          return {
            success: false,
            error: "Event not found",
          };
        }

        emailData = {
          subject: `Event Reminder - ${reminderEvent[0].title}`,
          html: generateEventReminderHTML({
            recipient_name: recipient_name || "Customer",
            event: reminderEvent[0],
          }),
        };
        break;

      case "event_approved":
        if (!event_id) {
          return {
            success: false,
            error: "Event ID is required for approval emails",
          };
        }

        const approvedEvent =
          await sql`SELECT title, event_date, venue FROM events WHERE id = ${event_id}`;

        if (!approvedEvent.length) {
          return {
            success: false,
            error: "Event not found",
          };
        }

        emailData = {
          subject: `Event Approved - ${approvedEvent[0].title}`,
          html: generateEventApprovalHTML({
            recipient_name: recipient_name || "Event Organizer",
            event: approvedEvent[0],
          }),
        };
        break;

      case "event_rejected":
        if (!event_id) {
          return {
            success: false,
            error: "Event ID is required for rejection emails",
          };
        }

        const rejectedEvent =
          await sql`SELECT title FROM events WHERE id = ${event_id}`;

        if (!rejectedEvent.length) {
          return {
            success: false,
            error: "Event not found",
          };
        }

        emailData = {
          subject: `Event Submission Update - ${rejectedEvent[0].title}`,
          html: generateEventRejectionHTML({
            recipient_name: recipient_name || "Event Organizer",
            event: rejectedEvent[0],
            admin_message:
              admin_message || "Your event submission needs revision.",
          }),
        };
        break;

      case "admin_notification":
        if (!event_id) {
          return {
            success: false,
            error: "Event ID is required for admin notifications",
          };
        }

        const newEvent = await sql`
          SELECT e.title, e.event_date, e.venue, u.name as organizer_name 
          FROM events e 
          JOIN auth_users u ON e.created_by = u.id 
          WHERE e.id = ${event_id}
        `;

        if (!newEvent.length) {
          return {
            success: false,
            error: "Event not found",
          };
        }

        emailData = {
          subject: `New Event Submission - ${newEvent[0].title}`,
          html: generateAdminNotificationHTML({
            event: newEvent[0],
          }),
        };
        break;

      case "payment_failed":
        emailData = {
          subject: "Payment Failed - Action Required",
          html: generatePaymentFailedHTML({
            recipient_name: recipient_name || "Customer",
            ticket_number: ticket_number,
          }),
        };
        break;

      default:
        return {
          success: false,
          error: "Invalid email type",
        };
    }

    console.log(`Sending ${type} email to ${recipient_email}`);
    console.log(`Subject: ${emailData.subject}`);

    return {
      success: true,
      message: "Email notification sent successfully",
      email_type: type,
      recipient: recipient_email,
    };
  } catch (error) {
    console.error("Error sending email notification:", error);
    return {
      success: false,
      error: "Failed to send email notification",
    };
  }
}

function generatePurchaseConfirmationHTML({ recipient_name, event, order }) {
  const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket Purchase Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .ticket-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ticket Purchase Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${recipient_name},</p>
          <p>Thank you for your ticket purchase! Your order has been confirmed.</p>
          
          <div class="ticket-info">
            <h3>Event Details</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Tickets:</strong> ${order.quantity}</p>
            <p><strong>Total Amount:</strong> $${parseFloat(
              order.total_amount
            ).toFixed(2)}</p>
            <p><strong>Ticket Number:</strong> ${order.ticket_number}</p>
          </div>
          
          <p>Please keep this email as your receipt and bring a valid ID to the event.</p>
        </div>
        <div class="footer">
          <p>Thank you for choosing our platform!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEventReminderHTML({ recipient_name, event }) {
  const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Event Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .event-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Event Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${recipient_name},</p>
          <p>This is a friendly reminder about your upcoming event!</p>
          
          <div class="event-info">
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
          </div>
          
          <p>Don't forget to bring your ticket and a valid ID. We look forward to seeing you there!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEventApprovalHTML({ recipient_name, event }) {
  const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Event Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .event-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Event Approved!</h1>
        </div>
        <div class="content">
          <p>Dear ${recipient_name},</p>
          <p>Great news! Your event has been approved and is now live on our platform.</p>
          
          <div class="event-info">
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
          </div>
          
          <p>Your event is now visible to users and they can start purchasing tickets.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEventRejectionHTML({ recipient_name, event, admin_message }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Event Submission Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .message-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #dc2626; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Event Submission Update</h1>
        </div>
        <div class="content">
          <p>Dear ${recipient_name},</p>
          <p>We've reviewed your event submission for "${event.title}" and it requires some changes before approval.</p>
          
          <div class="message-box">
            <h3>Admin Message:</h3>
            <p>${admin_message}</p>
          </div>
          
          <p>Please make the necessary changes and resubmit your event. If you have any questions, feel free to contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminNotificationHTML({ event }) {
  const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Event Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .event-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Event Submission</h1>
        </div>
        <div class="content">
          <p>A new event has been submitted and requires your review.</p>
          
          <div class="event-info">
            <h3>${event.title}</h3>
            <p><strong>Organizer:</strong> ${event.organizer_name}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
          </div>
          
          <p>Please log in to the admin dashboard to review and approve or reject this event.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentFailedHTML({ recipient_name, ticket_number }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Failed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .warning-box { background: #fef2f2; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #dc2626; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Failed</h1>
        </div>
        <div class="content">
          <p>Dear ${recipient_name},</p>
          
          <div class="warning-box">
            <p>We were unable to process your payment for ticket ${
              ticket_number || "your recent order"
            }.</p>
          </div>
          
          <p>Please check your payment method and try again. If you continue to experience issues, contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
export async function POST(request) {
  return handler(await request.json());
}