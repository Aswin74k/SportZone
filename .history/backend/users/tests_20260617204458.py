from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.core import mail
import threading


class WelcomeEmailTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        # Patch Thread.start to execute synchronously in tests to avoid race conditions
        self.original_start = threading.Thread.start
        threading.Thread.start = lambda t: t.run()

    def tearDown(self):
        # Restore original Thread.start
        threading.Thread.start = self.original_start

    def test_user_registration_sends_welcome_email(self):
        # Ensure outbox is clear
        mail.outbox = []

        data = {
            "name": "Aswin Kumar",
            "email": "aswin.kumar@example.com",
            "password": "securepassword123"
        }
        
        response = self.client.post(
            "/api/register/",
            data=data,
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # Verify user creation
        self.assertTrue(User.objects.filter(email="aswin.kumar@example.com").exists())

        # Verify welcome email was triggered and sent
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertEqual(sent_email.subject, "Welcome to SportZone")
        self.assertEqual(sent_email.to, ["aswin.kumar@example.com"])
        self.assertIn("Aswin Kumar", sent_email.body)
        
        # Verify HTML alternative exists
        self.assertEqual(len(sent_email.alternatives), 1)
        html_content, content_type = sent_email.alternatives[0]
        self.assertEqual(content_type, "text/html")
        self.assertIn("Welcome to SportZone", html_content)
        self.assertIn("Explore the Collection", html_content)

