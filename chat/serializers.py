from rest_framework import serializers

from .models import ChatRoom


class ChatRoomSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ChatRoom
        fields = ('id', 'name', 'owner',)
        read_only_fields = ('owner',)

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
