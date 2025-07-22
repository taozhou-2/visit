from flask_mail import Mail, Message
from config import Config
import os

mail = Mail()


def init_mail(app):
    mail.init_app(app)


def send_email_with_attachment(recipient, subject, body, file):
    msg = Message(
        subject=subject,
        sender=Config.MAIL_USERNAME,
        recipients=[recipient]
    )
    msg.body = body

    msg.attach(file.filename, file.content_type, file.read())

    mail.send(msg)