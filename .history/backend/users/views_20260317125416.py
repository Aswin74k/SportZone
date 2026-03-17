from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def register_user(request):
    data = request.data

    user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        password=data['password']
    )

    return Response({"message": "User created"})