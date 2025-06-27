from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UsuarioManager(BaseUserManager):
    def create_user(self, email_usuario, nome_usuario, senha=None):
        if not email_usuario:
            raise ValueError("O email é obrigatório.")
        user = self.model(email_usuario=email_usuario, nome_usuario=nome_usuario)
        user.set_password(senha)
        user.save(using=self._db)
        return user

    def create_superuser(self, email_usuario, nome_usuario, senha):
        user = self.create_user(email_usuario=email_usuario, nome_usuario=nome_usuario, senha=senha)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser, PermissionsMixin):
    id_usuario = models.AutoField(primary_key=True)
    nome_usuario = models.CharField(max_length=50)
    email_usuario = models.EmailField(max_length=254, unique=True)
    data_criacao_usuario = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email_usuario'
    REQUIRED_FIELDS = ['nome_usuario']

    def __str__(self):
        return self.nome_usuario