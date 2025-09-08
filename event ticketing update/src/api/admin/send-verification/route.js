async function handler({ email }) {
  const session = getSession();

  if (!session?.user?.id || !session?.user?.email) {
    return { error: "Unauthorized access" };
  }

  // Generate 6 digit code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Set expiry to 15 minutes from now
  const expiryDate = new Date(Date.now() + 15 * 60 * 1000);

  try {
    // Store verification code
    await sql`
      INSERT INTO auth_verification_token 
      (identifier, token, expires)
      VALUES 
      (${session.user.email}, ${verificationCode}, ${expiryDate})
      ON CONFLICT (identifier, token) 
      DO UPDATE SET expires = ${expiryDate}
    `;

    // Send email with code
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: session.user.email }],
          },
        ],
        from: { email: "noreply@eventtix.com" },
        subject: "EventTix Admin Verification Code",
        content: [
          {
            type: "text/plain",
            value: `Your verification code is: ${verificationCode}\nThis code will expire in 15 minutes.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return { success: true };
  } catch (error) {
    console.error("Verification code error:", error);
    return { error: "Failed to generate verification code" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}