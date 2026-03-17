from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def register_user(request):
    data = request.data

    if User.objects.filter(username=data['email']).exists():
        return Response({"message": "User already exists"}, status=400)

    user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        password=data['password']
    )

    return Response({"message": "User created successfully"})