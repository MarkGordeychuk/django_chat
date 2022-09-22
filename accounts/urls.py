from django.urls import path, reverse_lazy
from django.contrib.auth.views import LogoutView, PasswordChangeView

from .views import RegistrationView, UserUpdateView, LoginView

urlpatterns = [
    path('signin/', RegistrationView.as_view(), name='signin'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(template_name='accounts/logout.html'), name='logout'),
    path('update/', UserUpdateView.as_view(), name='update'),
    path('update/password/', PasswordChangeView.as_view(
        template_name='accounts/password_change.html',
        success_url=reverse_lazy('index')
    ), name='password_change'),
]
