from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from data_pipeline.config import settings

# keepalives keep the Neon pooled connection healthy across longer operations;
# pool_pre_ping + pool_recycle guard against stale/closed server-side sockets.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    future=True,
    connect_args={
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    },
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, future=True)
