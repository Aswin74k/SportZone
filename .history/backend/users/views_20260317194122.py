from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User


@api_view(['POST'])
def register_user(request):

    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    print("REGISTER DATA:", request.data)  # 🔥 debug

    # ✅ VALIDATION
    if not username:
        return Response({"error": "Username is required"}, status=400)

    if not email:
        return Response({"error": "Email is required"}, status=400)

    if not password:
        return Response({"error": "Password is required"}, status=400)

    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)

    # ✅ DUPLICATE CHECK
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    # ✅ CREATE USER
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response({
        "message": "Account created successfully",
        "username": user.username
    })

@api_view(['POST'])
def login_user(request):

    email = request.data.get('email')
    password = request.data.get('password')

    print("LOGIN DATA:", request.data)

    if not email or not password:
        return Response({"error": "Email & password required"}, status=400)

    # 🔥 FILTER instead of GET
    user_obj = User.objects.filter(email=email).first()

    if not user_obj:
        return Response({"error": "User not found"}, status=400)

    user = authenticate(username=user_obj.username, password=password)

    if user:
        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

    return Response({"error": "Invalid email or password"}, status=400)