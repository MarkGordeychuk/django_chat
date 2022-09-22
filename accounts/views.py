from django.contrib.auth.views import LoginView
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import CreateView, UpdateView
from django.contrib.auth import login

from .forms import UserRegistrationForm, UserUpdateForm
from .models import User


class RegistrationView(CreateView):
    model = User
    form_class = UserRegistrationForm
    template_name = 'accounts/registration.html'
    success_url = '/'

    def form_valid(self, form):
        response = super().form_valid(form)
        login(self.request, self.object)
        return response

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            self.object = request.user
            return redirect(self.get_success_url())

        return super().get(request, *args, **kwargs)


class LoginView(LoginView):
    template_name = 'accounts/login.html'
    success_url = '/'
    next_page = '/'

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(self.get_success_url())

        return super().get(request, *args, **kwargs)


class UserUpdateView(UpdateView):
    model = User
    form_class = UserUpdateForm
    template_name = 'accounts/update.html'
    success_url = reverse_lazy('index')

    def get_object(self, queryset=None):
        return self.request.user
