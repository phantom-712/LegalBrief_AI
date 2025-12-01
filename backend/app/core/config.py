"""
Configuration Management

This module handles the application configuration using Pydantic Settings.
It reads environment variables from a .env file and provides a centralized
settings object for the application.
"""

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings model.
    """
    PROJECT_NAME: str = "LegalBriefAI"
    
    # Qdrant Vector Database Configuration
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    
    # Google Gemini API Key
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        # Case sensitive environment variables
        case_sensitive = True

# Global settings instance
settings = Settings()
