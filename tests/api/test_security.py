from backend.app.core.security import (
    hash_password, verify_password, create_token, decode_token)


def test_hash_roundtrip():
    h = hash_password("s3cret-pw")
    assert h != "s3cret-pw"               # not plaintext
    assert h.startswith("pbkdf2_sha256$")
    assert verify_password("s3cret-pw", h) is True
    assert verify_password("wrong", h) is False


def test_hash_is_salted():
    assert hash_password("same") != hash_password("same")  # random salt


def test_verify_handles_garbage():
    assert verify_password("x", "not-a-valid-hash") is False


def test_token_roundtrip():
    tok = create_token("admin")
    assert decode_token(tok) == "admin"


def test_decode_rejects_tampered_token():
    tok = create_token("admin")
    assert decode_token(tok + "x") is None
    assert decode_token("garbage") is None
