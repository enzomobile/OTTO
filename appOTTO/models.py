from django.db import models

# Tabela de Usuários.
class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nome_usuario = models.CharField(max_length=50)
    email_usuario = models.EmailField(max_length=254, unique=True)
    senha_usuario = models.CharField(max_length=255)
    data_criacao_usuario = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome_usuario