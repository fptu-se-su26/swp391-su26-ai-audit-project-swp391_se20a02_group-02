import os
import pymssql
import logging
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class RAGEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not defined in the environment or .env file.")
        
        # SQL Server credentials
        self.db_server = os.getenv("DB_SERVER", "localhost")
        self.db_port = os.getenv("DB_PORT", "1433")
        self.db_user = os.getenv("DB_USER", "sa")
        self.db_password = os.getenv("DB_PASSWORD", "123456")
        self.db_name = os.getenv("DB_NAME", "car_rental_platform")
        
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=self.api_key
        )
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=self.api_key,
            temperature=0.3
        )
        
        self.vector_store = None
        self.index_path = os.path.join(os.path.dirname(__file__), "faiss_index")

    def connect_db(self):
        """Establishes connection to the SQL Server database."""
        logger.info(f"Connecting to SQL Server database '{self.db_name}' on {self.db_server}:{self.db_port}...")
        try:
            conn = pymssql.connect(
                server=self.db_server,
                port=int(self.db_port),
                user=self.db_user,
                password=self.db_password,
                database=self.db_name,
                charset='utf8'
            )
            return conn
        except Exception as e:
            logger.error(f"Failed to connect to SQL Server database: {str(e)}")
            raise ConnectionError(
                f"Không thể kết nối đến cơ sở dữ liệu SQL Server. Vui lòng kiểm tra cấu hình .env hoặc "
                f"chắc chắn rằng SQL Server đang chạy tại {self.db_server}:{self.db_port}.\nChi tiết lỗi: {str(e)}"
            )

    def fetch_vehicles_data(self) -> list:
        """Queries SQL Server database and compiles vehicle documents."""
        conn = self.connect_db()
        cursor = conn.cursor(as_dict=True)
        
        try:
            # 1. Fetch all available or approval-pending vehicles
            logger.info("Fetching vehicles table...")
            cursor.execute("""
                SELECT id, name, brand, model, year, category, description, 
                       price_per_day, deposit, city, horsepower, top_speed, 
                       seats, transmission, fuel_type, rating, total_reviews, status
                FROM vehicles
                WHERE status IN ('AVAILABLE', 'PENDING_APPROVAL', 'RENTED')
            """)
            vehicles = cursor.fetchall()
            logger.info(f"Found {len(vehicles)} vehicles in database.")
            
            # 2. Fetch vehicle features
            logger.info("Fetching vehicle features...")
            cursor.execute("SELECT vehicle_id, feature FROM vehicle_features")
            features_list = cursor.fetchall()
            features_map = {}
            for item in features_list:
                v_id = item['vehicle_id']
                feat = item['feature']
                if v_id not in features_map:
                    features_map[v_id] = []
                features_map[v_id].append(feat)
                
            # 3. Fetch reviews
            logger.info("Fetching vehicle reviews...")
            cursor.execute("SELECT vehicle_id, rating, comment FROM reviews")
            reviews_list = cursor.fetchall()
            reviews_map = {}
            for item in reviews_list:
                v_id = item['vehicle_id']
                rev_text = f"[{item['rating']}/5] {item['comment'] or 'Không có bình luận'}"
                if v_id not in reviews_map:
                    reviews_map[v_id] = []
                reviews_map[v_id].append(rev_text)
                
            # Compile text documents
            documents = []
            for v in vehicles:
                v_id = v['id']
                v_name = v['name']
                v_brand = v['brand']
                v_model = v['model']
                v_year = v['year']
                v_category = v['category']
                v_desc = v['description'] or "Chưa có mô tả chi tiết."
                v_price = f"{int(v['price_per_day']):,}" if v['price_per_day'] else "Thương lượng"
                v_deposit = f"{int(v['deposit']):,}" if v['deposit'] else "0"
                v_city = v['city']
                v_hp = v['horsepower'] or "N/A"
                v_speed = v['top_speed'] or "N/A"
                v_seats = v['seats']
                v_trans = "Tự động (Automatic)" if v['transmission'] == "AUTOMATIC" else "Số sàn (Manual)"
                v_fuel = v['fuel_type']
                v_rating = v['rating'] or "0.0"
                v_reviews_count = v['total_reviews'] or 0
                
                # Features
                v_features = ", ".join(features_map.get(v_id, ["Không có tiện ích đặc biệt"]))
                
                # Reviews
                v_reviews_summary = "\n".join([f"- {r}" for r in reviews_map.get(v_id, [])[:3]])
                if not v_reviews_summary:
                    v_reviews_summary = "Chưa có đánh giá nào từ khách hàng."

                # Construct rich textual document representation
                doc_content = f"""
Thông tin chi tiết xe: {v_brand} {v_model} (Tên thương mại: {v_name})
- Hãng sản xuất: {v_brand}
- Dòng xe / Model: {v_model}
- Năm sản xuất: {v_year}
- Phân khúc / Loại xe: {v_category}
- Hộp số: {v_trans}
- Nhiên liệu: {v_fuel}
- Số chỗ ngồi: {v_seats} chỗ
- Công suất (mã lực): {v_hp} HP
- Tốc độ tối đa: {v_speed} km/h
- Giá thuê mỗi ngày: {v_price} VND/ngày
- Tiền đặt cọc: {v_deposit} VND
- Khu vực hoạt động (Thành phố): {v_city}
- Điểm đánh giá trung bình: {v_rating}/5.0 ({v_reviews_count} đánh giá)
- Tiện ích & tính năng đi kèm: {v_features}
- Mô tả chi tiết: {v_desc}
- Một số nhận xét thực tế từ khách hàng:
{v_reviews_summary}
---
"""
                documents.append({
                    "content": doc_content,
                    "metadata": {
                        "id": v_id,
                        "name": v_name,
                        "brand": v_brand,
                        "model": v_model,
                        "price": v['price_per_day'],
                        "seats": v_seats,
                        "category": v_category,
                        "city": v_city
                    }
                })
            
            return documents
        
        finally:
            cursor.close()
            conn.close()

    def bootstrap_vector_db(self):
        """Fetches data from SQL Server, generates embeddings, and saves the vector database locally."""
        try:
            logger.info("Starting bootstrap process from SQL Server...")
            docs = self.fetch_vehicles_data()
            if not docs:
                logger.warning("No vehicles data found in database to build Vector DB.")
                return False
            
            texts = [doc["content"] for doc in docs]
            metadatas = [doc["metadata"] for doc in docs]
            
            logger.info(f"Embedding {len(texts)} vehicle documents into FAISS Vector DB...")
            self.vector_store = FAISS.from_texts(
                texts=texts,
                embedding=self.embeddings,
                metadatas=metadatas
            )
            
            # Save the index locally for fast future loads
            logger.info(f"Saving FAISS index locally to: {self.index_path}")
            self.vector_store.save_local(self.index_path)
            logger.info("FAISS Vector DB successfully bootstrapped and saved.")
            return True
            
        except Exception as e:
            logger.error(f"Error bootstrapping Vector DB: {str(e)}")
            raise e

    def load_vector_db(self):
        """Loads the vector database index from local storage. If not found, bootstraps it."""
        if os.path.exists(os.path.join(self.index_path, "index.faiss")):
            try:
                logger.info(f"Loading local FAISS index from {self.index_path}...")
                self.vector_store = FAISS.load_local(
                    self.index_path,
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
                logger.info("Local FAISS index successfully loaded.")
            except Exception as e:
                logger.warning(f"Failed to load local index: {str(e)}. Rebuilding from SQL Server...")
                self.bootstrap_vector_db()
        else:
            logger.info("Local FAISS index not found. Building from scratch from SQL Server...")
            self.bootstrap_vector_db()

    def query(self, user_query: str, history: list) -> str:
        """Performs semantic search (RAG) and generates response with Gemini."""
        if not self.vector_store:
            self.load_vector_db()
            
        if not self.vector_store:
            return "Xin lỗi, hiện tại tôi không thể truy cập kho dữ liệu xe. Vui lòng liên hệ quản trị viên."

        # Search for top 4 relevant vehicle documents
        logger.info(f"Retrieving documents for query: '{user_query}'...")
        retrieved_docs = self.vector_store.similarity_search(user_query, k=4)
        context = "\n".join([doc.page_content for doc in retrieved_docs])
        
        # Format conversation history
        history_formatted = ""
        for msg in history[-6:]:  # Only keep last 3 exchanges (6 messages) to prevent context pollution
            role = "Khách hàng" if msg.get("role") == "user" else "Trợ lý"
            history_formatted += f"{role}: {msg.get('content')}\n"

        # RAG Prompt template
        prompt_template = """
Bạn là LuxeWay AI, trợ lý tư vấn thuê xe chuyên nghiệp, cao cấp và vô cùng lịch sự của nền tảng LuxeWay.
Nhiệm vụ của bạn là sử dụng dữ liệu xe được cung cấp dưới đây để trả lời câu hỏi và tư vấn dòng xe phù hợp nhất với nhu cầu của Khách hàng.

[QUY TẮC PHẢN HỒI]
1. Chỉ tư vấn và trả lời thông tin dựa trên dữ liệu thật về xe được cung cấp trong [DỮ LIỆU XE CỦA HỆ THỐNG]. Không tự vẽ ra xe hoặc thông số xe không có trong dữ liệu.
2. Luôn phản hồi bằng tiếng Việt thân thiện, chuyên nghiệp, lịch sự (dùng xưng hô: "LuxeWay", "tôi" và "quý khách", "bạn").
3. Khi giới thiệu xe, hãy nêu rõ các thông tin quan trọng như: Tên xe, Hãng xe, Số chỗ ngồi, Hộp số, Giá thuê/ngày và Địa điểm (Thành phố) để khách hàng dễ lựa chọn.
4. Nếu khách hàng hỏi về một dòng xe, hãng xe hoặc địa điểm không có trong dữ liệu, hãy lịch sự thông báo hiện tại hệ thống chưa có xe đó và gợi ý các dòng xe tương tự sẵn có trong dữ liệu.
5. Luôn giữ cuộc trò chuyện tự nhiên, ngắn gọn và tập trung vào việc tư vấn thuê xe.

[DỮ LIỆU XE CỦA HỆ THỐNG]
{context}

[LỊCH SỬ TRÒ CHUYỆN]
{history}

Khách hàng: {question}
Trợ lý LuxeWay AI:"""

        prompt = PromptTemplate(
            input_variables=["context", "history", "question"],
            template=prompt_template
        )
        
        # Run LangChain execution
        chain = LLMChain(llm=self.llm, prompt=prompt)
        logger.info("Invoking Gemini model for response...")
        response = chain.run(
            context=context,
            history=history_formatted,
            question=user_query
        )
        
        return response.strip()
