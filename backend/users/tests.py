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


from django.core.cache import cache
from users.models import EmailOTP

class AuthSecurityTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        cache.clear()
        self.user = User.objects.create_user(
            username="testuser@example.com",
            email="testuser@example.com",
            password="Password123!"
        )

    def tearDown(self):
        cache.clear()

    def test_login_throttling(self):
        url = "/api/login/"
        payload = {"email": "testuser@example.com", "password": "wrongpassword"}
        for _ in range(5):
            res = self.client.post(url, data=payload, content_type="application/json")
            self.assertIn(res.status_code, [400, 429])

        res = self.client.post(url, data=payload, content_type="application/json")
        self.assertEqual(res.status_code, 429)

    def test_otp_failed_attempts_limit(self):
        EmailOTP.objects.create(user=self.user, otp="123456", is_verified=False)
        url = "/api/verify-otp/"
        payload = {"email": "testuser@example.com", "otp": "000000"}

        for _ in range(3):
            res = self.client.post(url, data=payload, content_type="application/json")
            self.assertEqual(res.status_code, 400)
            self.assertEqual(res.json().get("error"), "Invalid OTP")

        res = self.client.post(url, data=payload, content_type="application/json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Too many failed attempts", res.json().get("error", ""))

    def test_forgot_password_throttling(self):
        url = "/api/forgot-password/"
        payload = {"email": "testuser@example.com"}
        for _ in range(3):
            res = self.client.post(url, data=payload, content_type="application/json")
            self.assertIn(res.status_code, [200, 429])

        res = self.client.post(url, data=payload, content_type="application/json")
        self.assertEqual(res.status_code, 429)

    def test_otp_not_exposed_in_response(self):
        url = "/api/forgot-password/"
        payload = {"email": "testuser@example.com"}
        res = self.client.post(url, data=payload, content_type="application/json")
        self.assertEqual(res.status_code, 200)
        content_str = str(res.content)
        otp_row = EmailOTP.objects.filter(user=self.user).first()
        self.assertIsNotNone(otp_row)
        self.assertNotIn(otp_row.otp, content_str)



