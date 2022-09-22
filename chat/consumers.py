import asyncio

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model

from .models import ChatRoom, Client

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        task_add_client_to_db = asyncio.create_task(self.add_to_db())

        rooms = [room async for room in ChatRoom.objects.filter(users=self.scope['user']).order_by('id').values_list('id', flat=True)]

        self.groups = [f"room_{room}" for room in rooms]
        already_connected = (await asyncio.gather(
            *(self.channel_layer.group_add(group, self.channel_name) for group in self.groups),
            task_add_client_to_db
        ))[-1]
        await self.accept()
        if not already_connected:
            for channel in self.channel_layer.channels:
                if channel != self.channel_name:
                    asyncio.create_task(self.channel_layer.send(channel, {
                        'type': 'user_connected',
                        'user': self.scope['user'],
                        'rooms': rooms,
                    }))

    async def add_to_db(self):
        already_connected = await Client.objects.filter(user=self.scope['user']).aexists()
        await Client.objects.aupdate_or_create(channel_name=self.channel_name, defaults={'user': self.scope['user']})
        return already_connected

    async def disconnect(self, close_code):
        await asyncio.gather(
            *(self.channel_layer.group_add(group, self.channel_name) for group in self.groups),
            Client.objects.filter(channel_name=self.channel_name).adelete()
        )
        if not await Client.objects.filter(user=self.scope['user']).aexists():
            for channel in self.channel_layer.channels:
                if channel != self.channel_name:
                    asyncio.create_task(self.channel_layer.send(channel, {
                        'type': 'user_disconnected',
                        'user_id': self.scope['user'].id,
                    }))

    async def receive_json(self, content, **kwargs):
        if not content.get('messageType', False):
            return await self.error_message("No 'messageType' in your JSON")

        if content['messageType'] == "chatMessage":
            message = content.get('message', {})
            if not message.get('text', False):
                return await self.error_message("No 'messageText' in message")

            if not message.get('roomID', False):
                return await self.error_message("No 'roomID' in message")

            await self.channel_layer.group_send(
                f"room_{message['roomID']}",
                {
                    'type': 'chat_message',
                    'room_id': message['roomID'],
                    'user': self.scope['user'],
                    'text': message['text'],
                }
            )

    async def chat_message(self, event):
        if self.scope['user'] == event['user']:
            return

        await self.send_json(content={
            'messageType': "chatMessage",
            'message': {
                'roomID': event['room_id'],
                'user': event['user'].name,
                'avatar': str(event['user'].avatar),
                'text': event['text'],
            }
        })

    async def user_connected(self, event):
        await self.send_json(content={
            'messageType': "userConnected",
            'message': {
                'rooms': event['rooms'],
                'user': {
                    'id': event['user'].id,
                    'name': event['user'].name,
                    'avatar': str(event['user'].avatar),
                }
            }
        })

    async def user_disconnected(self, event):
        await self.send_json(content={
            'messageType': "userDisconnected",
            'message': {
                'user': {'id': event['user_id']}
            }
        })

    async def error_message(self, message):
        await self.send_json(content={
            'messageType': "error",
            'message': {
                'text': message,
            }
        })
