import smtplib
from email.message import EmailMessage

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "your_email@gmail.com"
SENDER_PASSWORD = "your_app_password"  # Use App Password if 2FA is on

def send_welcome_email(recipient_email, username):
    msg = EmailMessage()
    msg["Subject"] = "Welcome to Credit Score App"
    msg["From"] = SENDER_EMAIL
    msg["To"] = recipient_email
    msg.set_content(f"Hi {username},\n\nThank you for registering!")

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
            smtp.send_message(msg)
            print(f"Email sent to {recipient_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
