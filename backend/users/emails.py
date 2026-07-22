from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


def send_verification_email(user):
    """
    Send email verification link to user
    """
    try:
        # Get frontend URL from environment or use default
        frontend_url = settings.FRONTEND_URL
        verification_url = f"{frontend_url}/verify-email?token={user.verification_token}"

        subject = 'Verify Your Email - The Social Hub'

        # HTML email content
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .container {{
                    background-color: #f9f9f9;
                    border-radius: 10px;
                    padding: 30px;
                    border: 1px solid #e0e0e0;
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .header h1 {{
                    color: #2563eb;
                    margin: 0;
                }}
                .content {{
                    background-color: white;
                    padding: 25px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 30px;
                    background-color: #2563eb;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .footer {{
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    margin-top: 20px;
                }}
                .token {{
                    background-color: #f3f4f6;
                    padding: 10px;
                    border-radius: 5px;
                    font-family: monospace;
                    word-break: break-all;
                    margin: 10px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>The Social Hub</h1>
                </div>
                <div class="content">
                    <h2>Welcome, {user.first_name}!</h2>
                    <p>Thank you for registering with The Social Hub. Please verify your email address to complete your registration.</p>

                    <p>Click the button below to verify your email:</p>

                    <div style="text-align: center;">
                        <a href="{verification_url}" class="button">Verify Email Address</a>
                    </div>

                    <p>Or copy and paste this link into your browser:</p>
                    <div class="token">{verification_url}</div>

                    <p><strong>This link will expire in 24 hours.</strong></p>

                    <p>If you didn't create an account with The Social Hub, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 The Social Hub. All rights reserved.</p>
                    <p>This is an automated email, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text fallback
        plain_message = f"""
        Welcome to The Social Hub, {user.first_name}!

        Thank you for registering. Please verify your email address by clicking the link below:

        {verification_url}

        This link will expire in 24 hours.

        If you didn't create an account, please ignore this email.

        ---
        The Social Hub Team
        """

        # Create email
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_message, "text/html")

        # Send email
        email.send(fail_silently=False)

        logger.info(f"Verification email sent successfully to {user.email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
        # Don't raise the exception - allow registration to continue
        return False


def send_password_reset_email(user, reset_token):
    """
    Send password reset link to user
    """
    try:
        # Get frontend URL from environment or use default
        frontend_url = settings.FRONTEND_URL
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"

        subject = 'Password Reset - The Social Hub'

        # HTML email content
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .container {{
                    background-color: #f9f9f9;
                    border-radius: 10px;
                    padding: 30px;
                    border: 1px solid #e0e0e0;
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .header h1 {{
                    color: #2563eb;
                    margin: 0;
                }}
                .content {{
                    background-color: white;
                    padding: 25px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 30px;
                    background-color: #dc2626;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .footer {{
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    margin-top: 20px;
                }}
                .token {{
                    background-color: #f3f4f6;
                    padding: 10px;
                    border-radius: 5px;
                    font-family: monospace;
                    word-break: break-all;
                    margin: 10px 0;
                }}
                .warning {{
                    background-color: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 10px;
                    margin: 15px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>The Social Hub</h1>
                </div>
                <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>Hi {user.first_name},</p>
                    <p>We received a request to reset your password for your The Social Hub account.</p>

                    <p>Click the button below to reset your password:</p>

                    <div style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </div>

                    <p>Or copy and paste this link into your browser:</p>
                    <div class="token">{reset_url}</div>

                    <p><strong>This link will expire in 24 hours.</strong></p>

                    <div class="warning">
                        <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2024 The Social Hub. All rights reserved.</p>
                    <p>This is an automated email, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text fallback
        plain_message = f"""
        Password Reset Request - The Social Hub

        Hi {user.first_name},

        We received a request to reset your password. Click the link below to reset it:

        {reset_url}

        This link will expire in 24 hours.

        If you didn't request a password reset, please ignore this email.

        ---
        The Social Hub Team
        """

        # Create email
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_message, "text/html")

        # Send email
        email.send(fail_silently=False)

        logger.info(f"Password reset email sent successfully to {user.email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
        return False


def send_welcome_email(user):
    """
    Send welcome email after successful email verification
    """
    try:
        subject = 'Welcome to The Social Hub!'

        # HTML email content
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .container {{
                    background-color: #f9f9f9;
                    border-radius: 10px;
                    padding: 30px;
                    border: 1px solid #e0e0e0;
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .header h1 {{
                    color: #2563eb;
                    margin: 0;
                }}
                .content {{
                    background-color: white;
                    padding: 25px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }}
                .feature {{
                    margin: 15px 0;
                    padding: 10px;
                    background-color: #f3f4f6;
                    border-radius: 5px;
                }}
                .footer {{
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    margin-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to The Social Hub!</h1>
                </div>
                <div class="content">
                    <h2>Hi {user.first_name},</h2>
                    <p>Your email has been verified successfully! You're now part of The Social Hub community.</p>

                    <h3>What you can do now:</h3>

                    <div class="feature">
                        <strong>🎉 Discover Events</strong><br>
                        Browse and join events happening at your university and accommodation
                    </div>

                    <div class="feature">
                        <strong>💬 Connect with Students</strong><br>
                        Chat with other students in your community
                    </div>

                    <div class="feature">
                        <strong>📰 Stay Updated</strong><br>
                        Get personalized news and updates from your university
                    </div>

                    <div class="feature">
                        <strong>🎯 Get Recommendations</strong><br>
                        Our AI recommends events based on your interests
                    </div>

                    <p>Start exploring and make the most of your student life!</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 The Social Hub. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text fallback
        plain_message = f"""
        Welcome to The Social Hub!

        Hi {user.first_name},

        Your email has been verified successfully! You're now part of The Social Hub community.

        What you can do now:
        - Discover Events: Browse and join events at your university
        - Connect with Students: Chat with other students
        - Stay Updated: Get personalized news from your university
        - Get Recommendations: AI-powered event suggestions

        Start exploring and make the most of your student life!

        ---
        The Social Hub Team
        """

        # Create email
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_message, "text/html")

        # Send email
        email.send(fail_silently=False)

        logger.info(f"Welcome email sent successfully to {user.email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
        return False
