from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    cors_origins: str = "http://localhost:3000"
    rate_limit_enabled: bool = True
    secret_key: str = "dev-secret"

    model_config = SettingsConfigDict(
        env_file="backend/.env", extra="ignore", case_sensitive=False)

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
