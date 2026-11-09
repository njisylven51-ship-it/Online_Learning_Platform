from fastapi import HTTPException, UploadFile

ALLOWED_MIME = {"application/pdf", "image/jpeg", "image/png", "image/webp"}


async def validate_document(upload: UploadFile, max_size: int) -> None:
    if upload.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=415, detail="Unsupported document type")
    header = await upload.read(16)
    await upload.seek(0)
    valid = header.startswith(b"%PDF-") if upload.content_type == "application/pdf" else header.startswith(b"\x89PNG\r\n\x1a\n") if upload.content_type == "image/png" else header.startswith(b"\xff\xd8\xff") if upload.content_type == "image/jpeg" else header.startswith(b"RIFF") and header[8:12] == b"WEBP"
    if not valid:
        raise HTTPException(status_code=415, detail="File content does not match its declared type")
    size = 0
    while chunk := await upload.read(1024 * 1024):
        size += len(chunk)
        if size > max_size:
            raise HTTPException(status_code=413, detail="File exceeds the configured size limit")
    await upload.seek(0)
