from django.db import models

from django.contrib.auth import get_user_model


UserModel = get_user_model()


class ChatRoom(models.Model):
    name = models.CharField(max_length=150, unique=True)
    owner = models.ForeignKey(UserModel, on_delete=models.PROTECT)
    users = models.ManyToManyField(UserModel, blank=True, related_name='chat_rooms')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.users.add(self.owner)


class Client(models.Model):
    channel_name = models.CharField(max_length=50, primary_key=True)
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE)
