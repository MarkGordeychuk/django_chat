from django.contrib.auth import get_user_model
from django.db.models import F
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import ChatRoom, Client
from .serializers import ChatRoomSerializer
from .permissions import IsOwnerOrReadOnly


User = get_user_model()


class IndexView(LoginRequiredMixin, TemplateView):
    template_name = 'chat/index.html'
    login_url = 'accounts:login'


class ChatRoomListCreateAPIView(generics.ListCreateAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        if 'my' in self.request.query_params:
            queryset = queryset.filter(users=self.request.user)
        elif 'all' not in self.request.query_params:
            queryset = queryset.exclude(users=self.request.user)

        return queryset


class ChatRoomAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = (IsOwnerOrReadOnly, )


@api_view(['POST'])
def join_room_api_view(request, pk: int):
    chat_room = get_object_or_404(ChatRoom.objects.all(), pk=pk)
    chat_room.users.add(request.user)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def leave_room_api_view(request, pk: int):
    chat_room = get_object_or_404(ChatRoom.objects.all(), pk=pk)

    if chat_room.owner == request.user:
        return Response({"message": "You can't leave the room you own."}, status=status.HTTP_403_FORBIDDEN)

    chat_room.users.remove(request.user)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def get_user_list(request, pk: int):
    channel_layer = get_channel_layer()
    channels = set(channel_layer.groups.get(f"room_{pk}", {}))
    users = list(User.objects.filter(client__channel_name__in=channels)
                 .values('id', 'name', 'avatar'))

    return Response(users, status=status.HTTP_200_OK)

