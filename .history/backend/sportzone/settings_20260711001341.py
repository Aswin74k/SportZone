from pathlib import Path
from datetime import timedelta
import os
import dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env
env_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_path):
    print(f"[RAZORPAY DEBUG] Loading .env from: {env_path}")
    dotenv.load_dotenv(env_path, override=True)
else:
    fallback_env_path = os.path.join(BASE_DIR.parent, '.env')
    if os.path.exists(fallback_env_path):
        print(f"[RAZORPAY DEBUG] Loading fallback .env from: {fallback_env_path}")
        dotenv.load_dotenv(fallback_env_path, override=True)
    else:
        print("[RAZORPAY DEBUG] No .env file found in backend or root directory!")



# SECURITY
SECRET_KEY = 'your-very-long-random-secret-key-at-least-32-characters'

DEBUG = True

ALLOWED_HOSTS = ["127.0.0.1", "localhost"]


# APPLICATIONS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'corsheaders',
    'rest_framework',

    # Local apps
    'orders',
    'products',
    'users',
]


# =========================
# MIDDLEWARE
# =========================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # MUST BE FIRST
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',

    # ⚠️ disable CSRF for API (important for React)
    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'sportzone.urls'


# =========================
# TEMPLATES
# =========================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


WSGI_APPLICATION = 'sportzone.wsgi.application'


# DATABASE (MySQL)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'sportzone',
        'USER': 'root',
        'PASSWORD': 'aswink001',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
]


LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True



STATIC_URL = '/static/'



MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'UNAUTHENTICATED_USER': None, 
}



SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}


CORS_ALLOW_ALL_ORIGINS = True

# optional (extra safe)
CORS_ALLOW_CREDENTIALS = True


# =========================
# EMAIL SETTINGS (OTP)
# =========================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'sportzone.support@gmail.com'
EMAIL_HOST_PASSWORD = 'tmqnmfkytbtkloar'

# =========================
# RAZORPAY SETTINGS
# =========================
from django.core.exceptions import ImproperlyConfigured

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

print("=== SERVER STARTUP RAZORPAY DEBUG ===")
print(f"Loaded KEY ID: {RAZORPAY_KEY_ID}")
if RAZORPAY_KEY_SECRET:
    print(f"Loaded SECRET (first 5 chars): {RAZORPAY_KEY_SECRET[:5]}...")
else:
    print("Loaded SECRET: None")

# Verify python-dotenv key ID format (starts with "rzp_test_" or "rzp_live_")
if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    print("[RAZORPAY CRITICAL ERROR] Razorpay credentials are missing!")
    raise ImproperlyConfigured("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment or .env file.")

if not (RAZORPAY_KEY_ID.startswith("rzp_test_") or RAZORPAY_KEY_ID.startswith("rzp_live_")):
    print(f"[RAZORPAY CRITICAL ERROR] Typo or invalid format in RAZORPAY_KEY_ID: '{RAZORPAY_KEY_ID}'")
    raise ImproperlyConfigured("RAZORPAY_KEY_ID must start with 'rzp_test_' or 'rzp_live_'.")

print("[RAZORPAY DEBUG] Razorpay credentials verified successfully at startup.")
print("=====================================")

# =========================
# FRONTEND CONFIG
# =========================
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
