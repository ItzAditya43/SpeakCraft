from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ToolTemplate, UserTool

# Customizing the User admin to match the custom model
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('email', 'username', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    search_fields = ('email', 'username')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )

class ToolTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'tool_type', 'language', 'config_json')
    search_fields = ('name', 'tool_type')

class UserToolAdmin(admin.ModelAdmin):
    list_display = ('user', 'template', 'created_at', 'config_json')
    list_filter = ('created_at',)
    search_fields = ('user__username',)

admin.site.register(User, UserAdmin)
admin.site.register(ToolTemplate, ToolTemplateAdmin)
admin.site.register(UserTool, UserToolAdmin)
