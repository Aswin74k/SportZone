from rest_framework.throttling import SimpleRateThrottle


class LoginRateThrottle(SimpleRateThrottle):
    scope = 'login'

    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }


class RegisterRateThrottle(SimpleRateThrottle):
    scope = 'register'

    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }


class ForgotPasswordRateThrottle(SimpleRateThrottle):
    scope = 'forgot_password'

    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }


class VerifyOTPRateThrottle(SimpleRateThrottle):
    scope = 'verify_otp'

    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }


class ResetPasswordRateThrottle(SimpleRateThrottle):
    scope = 'reset_password'

    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }
