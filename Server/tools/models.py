from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class ToolTemplate(models.Model):
    name = models.CharField(max_length=100)
    tool_type = models.CharField(max_length=50)  # planner, checklist, etc.
    description = models.TextField()
    config_json = models.JSONField(default=dict)  # Base design + logic structure
    language = models.CharField(max_length=10)  # 'en', 'hi', etc.

class UserTool(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    template = models.ForeignKey(ToolTemplate, on_delete=models.SET_NULL, null=True)
    config_json = models.JSONField(default=dict)  # Customized version
    created_at = models.DateTimeField(auto_now_add=True)
