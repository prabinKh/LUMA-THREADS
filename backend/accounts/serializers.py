from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "name",
            "phone",
            "address",
            "city",
            "postal_code",
            "country",
            "is_staff",
            "is_superuser",
            "created_at",
        ]
        read_only_fields = ["id", "is_staff", "is_superuser", "created_at"]

    def get_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username or obj.email


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False, write_only=True, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "name", "email", "password", "password2"]

    def validate(self, attrs):
        p1 = attrs.get("password")
        p2 = attrs.get("password2")
        if p2 and p1 != p2:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        name = validated_data.pop("name", "")
        validated_data.pop("password2", None)
        email = validated_data.get("email")
        username = validated_data.get("username") or email.split("@")[0]

        # Ensure unique username
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        parts = name.split(" ", 1) if name else ["", ""]
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data["password"],
            first_name=first_name,
            last_name=last_name,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = None
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(username=user_obj.email, password=password)
            if not user:
                user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        attrs["user"] = user
        return attrs

