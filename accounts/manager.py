from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, login, password=None, name=''):
        """
        Creates and saves a User with the given login and password.
        """
        if not login:
            raise ValueError('Users must have login')

        user = self.model(
            login=login,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, login, password=None, name=''):
        """
        Creates and saves a superuser with the given login and password.
        """
        user = self.create_user(
            login,
            password=password,
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
