from django.contrib.auth.forms import UserCreationForm, UsernameField
from django import forms

from .models import User


class UserRegistrationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('login', 'name')
        field_classes = {"login": UsernameField}


class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('name', 'avatar')
