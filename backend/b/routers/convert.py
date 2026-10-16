from io import BytesIO

from fastapi import APIRouter, File, Form, UploadFile,HTTPException
from PIL import Image
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.post("/convert")
async def dealwithfile(file: UploadFile = File(...),target_format: str = Form(...)):
     # 1. 校验格式
    PILLOW_FORMAT = {"jpg": "JPEG", "jpeg": "JPEG", "png": "PNG", "webp": "WEBP", "bmp": "BMP", "gif": "GIF", "tiff": "TIFF","ico":"ICO"}
    fmt = target_format.lower()
    if fmt not in PILLOW_FORMAT:
          raise HTTPException(status_code=400, detail="Invalid format")
     
    contents = file.file.read()
    if len(contents) > 2048 * 1024 * 1024: # 20M
          raise HTTPException(status_code=400, detail="File too large")
     
    try:
        img = Image.open(BytesIO(contents))
        img.verify()
        img = Image.open(BytesIO(contents))  # verify 后要重开
    except Exception:
        raise HTTPException(415, "无效的图片文件")

    # 4. 模式预处理（JPG 白底合成等）
    if fmt in ("jpg", "jpeg"):
        if img.mode in ("RGBA", "LA"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[-1])
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")

    # 5. 保存到内存
    out = BytesIO()
    img.save(out, format=PILLOW_FORMAT[fmt], quality=90)
    out.seek(0)

    return StreamingResponse(
        out,
        media_type=f"image/{fmt}",
        headers={"Content-Disposition": f'attachment; filename="converted.{fmt}"'},
    )
