import logging
import threading
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def send_html_email(subject, template_name, context, to_email, text_fallback=None):
    """
    Sends an HTML email with a fallback text body.
    Catches all exceptions to ensure graceful failure.
    """
    try:
        from_email = f"SportZone  <{settings.EMAIL_HOST_USER}>"
        
        # Render HTML body
        html_body = render_to_string(template_name, context)
        
        # Generate clean text body if fallback not provided
        if not text_fallback:
            text_fallback = strip_tags(html_body).strip()
            
        msg = EmailMultiAlternatives(subject, text_fallback, from_email, [to_email])
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Successfully sent email to {to_email} with subject: {subject}")
        return True
    except Exception as e:
        logger.error(
            f"Failed to send email to {to_email} with subject '{subject}': {str(e)}", 
            exc_info=True
        )
        return False


# 1. Welcome Email Utilities

def send_welcome_email(user):
    """
    Sends a Welcome Email to a newly registered user.
    """
    name = (user.first_name or "").strip() or user.username or "User"
    subject = "Welcome to SportZone"
    context = {
        "name": name,
        "frontend_url": getattr(settings, "FRONTEND_URL", "http://localhost:5173"),
    }
    return send_html_email(
        subject=subject,
        template_name="email/welcome_email.html",
        context=context,
        to_email=user.email,
    )


def send_welcome_email_async(user):
    """
    Sends a Welcome Email asynchronously.
    """
    thread = threading.Thread(target=send_welcome_email, args=(user,))
    thread.start()
    return thread


# 2. Order Confirmation Email Utilities

def send_order_confirmation_email(order):
    """
    Sends an Order Confirmation Email to the customer.
    """
    customer_name = order.shipping_name or (order.user.first_name or "").strip() or order.user.username or "Customer"
    subject = f"Your SportZone Order #{order.id} Has Been Confirmed ✅"
    
    # Retrieve order items
    items = order.orderitem_set.all()
    
    context = {
        "customer_name": customer_name,
        "order": order,
        "items": items,
        "frontend_url": getattr(settings, "FRONTEND_URL", "http://localhost:5173"),
    }
    return send_html_email(
        subject=subject,
        template_name="email/order_confirmation_email.html",
        context=context,
        to_email=order.user.email,
    )


def send_order_confirmation_email_async(order):
    """
    Sends an Order Confirmation Email asynchronously.
    """
    thread = threading.Thread(target=send_order_confirmation_email, args=(order,))
    thread.start()
    return thread


# 3. Order Delivered Email Utilities

def send_order_delivered_email(order):
    """
    Sends an Order Delivered Email to the customer.
    """
    customer_name = order.shipping_name or (order.user.first_name or "").strip() or order.user.username or "Customer"
    subject = f"Your SportZone Order #{order.id} Has Been Delivered 📦"
    context = {
        "customer_name": customer_name,
        "order": order,
        "frontend_url": getattr(settings, "FRONTEND_URL", "http://localhost:5173"),
    }
    return send_html_email(
        subject=subject,
        template_name="email/order_delivered_email.html",
        context=context,
        to_email=order.user.email,
    )


def send_order_delivered_email_async(order):
    """
    Sends an Order Delivered Email asynchronously.
    """
    thread = threading.Thread(target=send_order_delivered_email, args=(order,))
    thread.start()
    return thread
