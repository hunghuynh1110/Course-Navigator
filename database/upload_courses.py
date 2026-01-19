import json
import os
from supabase import create_client, Client
from tqdm import tqdm

# ======================================================
# 1. CẤU HÌNH KẾT NỐI
# ======================================================
try:
    from URL_KEYS import SUPABASE_URL, SUPABASE_KEY
except ImportError:
    print("❌ Lỗi: Không tìm thấy file URL_KEYS.py hoặc thiếu biến environment.")
    exit(1)

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"❌ Lỗi kết nối Supabase: {e}")
    exit(1)

# ======================================================
# 2. ĐỌC FILE JSON TỪ THƯ MỤC DATA
# ======================================================
# Đường dẫn lùi ra 1 cấp (..) rồi vào data
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, '..', 'data', 'master_courses.json')

try:
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"📖 Đã đọc thành công {len(data)} môn học từ file.")
except FileNotFoundError:
    print(f"❌ Lỗi: Không tìm thấy file tại '{json_path}'")
    print("👉 Hãy kiểm tra lại xem file json đã nằm trong folder 'data' chưa.")
    data = []

# ======================================================
# 3. UPLOAD DỮ LIỆU LÊN SUPABASE
# ======================================================
if data:
    print("🚀 Bắt đầu đẩy dữ liệu lên Supabase...")
    
    batch_size = 50 
    buffer = []
    
    for course in tqdm(data, desc="Uploading"):
        # Tạo bản ghi theo đúng cột trong Database
        record = {
            "id": course["code"],             # Mã môn làm ID (VD: CSSE1001)
            "title": course["title"],         # Tên môn
            "raw_data": course                # Toàn bộ dữ liệu JSON nhét vào đây
        }
        buffer.append(record)
        
        # Gửi theo nhóm (Batch) để nhanh hơn
        if len(buffer) >= batch_size:
            try:
                # upsert: Có rồi thì cập nhật, chưa có thì thêm mới
                supabase.table("courses").upsert(buffer).execute()
                buffer = [] # Xóa buffer sau khi gửi
            except Exception as e:
                print(f"⚠️ Lỗi batch: {e}")

    # Gửi nốt những môn còn lại trong buffer
    if buffer:
        try:
            supabase.table("courses").upsert(buffer).execute()
        except Exception as e:
            print(f"⚠️ Lỗi batch cuối: {e}")

    print("\n✅ HOÀN TẤT! Hãy vào Supabase Dashboard > Table Editor để kiểm tra.")
else:
    print("⚠️ Không có dữ liệu để upload.")
