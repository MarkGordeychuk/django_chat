from django.urls import path
from rest_framework import routers

from .views import IndexView, ChatRoomListCreateAPIView, ChatRoomAPIView, join_room_api_view, leave_room_api_view,\
    get_user_list

router = routers.SimpleRouter()

urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('api/chat/', ChatRoomListCreateAPIView.as_view(), name='list_create'),
    path('api/chat/<int:pk>/', ChatRoomAPIView.as_view(), name='chat_room'),
    path('api/chat/<int:pk>/join/', join_room_api_view, name='join_chat_room'),
    path('api/chat/<int:pk>/leave/', leave_room_api_view, name='leave_chat_room'),
    path('api/chat/<int:pk>/users/', get_user_list, name='user_list'),
]
