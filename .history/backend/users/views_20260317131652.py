from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(['POST'])
def login_user(request):

    email = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=email, password=password)

    if user is not None:

        refresh = RefreshToken.for_user(user)

        # 🔥 ADD THIS LINE
        refresh['username'] = user.username

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

    return Response({"error": "Invalid credentials"}, status=400)