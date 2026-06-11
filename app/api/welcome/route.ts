import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Reddix Tech Enterprises <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Reddix Tech Enterprises! 🚁',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
          <h2 style="color: #0ea5e9;">Welcome to Reddix Tech Enterprises! 🚁</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hi ${name || 'there'},</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">We are absolutely thrilled to have you on board! You've just taken your first step into the future of flight and enterprise-grade technology.</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Your account has been successfully created. You can now explore our premium selection of custom drones, aerial systems, and 3D printing services.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://reddix-tech-drones.vercel.app/shop" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Explore the Shop</a>
          </div>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Get ready for takeoff!</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5; font-weight: bold;">- The Reddix Tech Team</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
}
