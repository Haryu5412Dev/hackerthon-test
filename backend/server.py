from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
from flask_cors import CORS
from module.onclick_translator import OnClickTranslator

class FlaskApp:
    def __init__(self):
        self.app = Flask(__name__)
        self.app.secret_key = secrets.token_hex(32)  # Random Secret Key
        CORS(self.app, supports_credentials=True)
        self.translator = OnClickTranslator(model_name="gpt-4-turbo")
        self.load_environment_variables()
        self.configure_database()
        self.mysql = MySQL(self.app)
        self.tables_initialized = False
        self.register_routes()
        self.initialize_hooks()

    def load_environment_variables(self):
        load_dotenv()

    def configure_database(self):
        self.app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
        self.app.config['MYSQL_PORT'] = int(os.getenv('MYSQL_PORT'))
        self.app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
        self.app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
        self.app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')

    def migrate_table(self):
        try:
            cur = self.mysql.connection.cursor()

            cur.execute("SHOW COLUMNS FROM users LIKE 'user_id'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE users ADD COLUMN user_id CHAR(36) UNIQUE AFTER id")
                cur.execute("UPDATE users SET user_id = UUID()")

            cur.execute("SHOW COLUMNS FROM users LIKE 'create_date'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE users ADD COLUMN create_date DATETIME DEFAULT CURRENT_TIMESTAMP AFTER password")

            cur.execute("SHOW COLUMNS FROM users LIKE 'country'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE users ADD COLUMN country VARCHAR(10) DEFAULT 'US' AFTER create_date")

            cur.execute("SHOW COLUMNS FROM users LIKE 'age'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE users ADD COLUMN age VARCHAR(50) NOT NULL AFTER country")

            cur.execute("SELECT MAX(id) FROM users")
            max_id = cur.fetchone()[0] or 0
            cur.execute(f"ALTER TABLE users AUTO_INCREMENT = {max_id + 1}")

            self.mysql.connection.commit()
            cur.close()
            print("Table migration completed.")
        except Exception as e:
            print(f"Error during table migration: {e}")

    def create_tables(self):
        table_creation_query = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id CHAR(36) NOT NULL UNIQUE,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            age VARCHAR(50) NOT NULL,
            country VARCHAR(10) DEFAULT 'US',
            create_date DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """
        try:
            cur = self.mysql.connection.cursor()
            cur.execute(table_creation_query)
            self.mysql.connection.commit()
            cur.close()
            print("Tables verified or created successfully.")
            self.migrate_table()
        except Exception as e:
            print(f"Error creating tables: {e}")

    def initialize_hooks(self):
        @self.app.before_request
        def initialize_database():
            if not self.tables_initialized:
                self.create_tables()
                self.tables_initialized = True

    def register_routes(self):
        app = self.app

        @app.route('/')
        def home():
            return render_template('home.html')

        @app.route('/api/register', methods=['POST'])
        def register():
            data = request.get_json()
            username = data['username']
            password = data['password']
            country = data['country']
            age = data['age']

            hashed_password = generate_password_hash(password)
            user_id = str(uuid.uuid4())

            try:
                cur = self.mysql.connection.cursor()
                cur.execute(
                    "INSERT INTO users (user_id, username, password, country, age) VALUES (%s, %s, %s, %s, %s)",
                    (user_id, username, hashed_password, country, age)
                )
                self.mysql.connection.commit()
                cur.close()
                return jsonify({"message": "User registered successfully."}), 200
            except Exception as e:
                print(f"Error during registration: {e}")
                return jsonify({"message": "Registration failed: Username may already exist or other error occurred."}), 400

        @app.route('/api/login', methods=['POST'])
        def login():
            data = request.get_json()
            username = data['username']
            password = data['password']

            cur = self.mysql.connection.cursor()
            cur.execute("SELECT * FROM users WHERE username = %s", [username])
            user = cur.fetchone()
            cur.close()

            if user and check_password_hash(user[3], password):
                token = secrets.token_hex(16)
                return jsonify({"token": token}), 200
            else:
                return jsonify({"message": "Invalid credentials."}), 401

        @app.route('/api/translate', methods=['POST'])
        def translate():
            # 요청 데이터 가져오기
            data = request.get_json()
            text = data.get("text", "")
            user_id = session.get('user_id')  # 사용자 세션에서 user_id 가져오기

            if not text:
                return jsonify({"error": "Text is required"}), 400

            # 클라이언트 언어 감지 (Accept-Language 헤더 확인)
            client_language = request.headers.get('Accept-Language', 'en').split(",")[0].split("-")[0]  # 언어 코드만 추출

            # 내 언어 정보 가져오기 (DB 또는 기본값 설정)
            my_language = "ko"  # 기본 언어 (한국어)
            if user_id:
                try:
                    cur = self.mysql.connection.cursor()
                    cur.execute("SELECT language FROM users WHERE user_id = %s", [user_id])
                    result = cur.fetchone()
                    if result:
                        my_language = result[0]  # 데이터베이스에 저장된 내 언어
                    cur.close()
                except Exception as e:
                    print(f"Error fetching user language: {e}")

            # 번역 처리
            try:
                # 번역 수행 (설명 생략)
                translated_text = self.translator.translate(client_language, my_language, text)
                return jsonify({"translated_text": translated_text})
            except Exception as e:
                print(f"Translation error: {e}")
                return jsonify({"error": "An error occurred during translation."}), 500

        @app.route('/dashboard')
        def dashboard():
            if 'username' in session:
                return f"Welcome, {session['username']}! <a href='/logout'>Logout</a>"
            else:
                return redirect(url_for('login'))

        @app.route('/logout')
        def logout():
            session.pop('username', None)
            flash("Logged out successfully.")
            return redirect(url_for('login'))

        @app.route('/user_list')
        def user_list():
            try:
                cur = self.mysql.connection.cursor()
                cur.execute("SELECT user_id, username, country, age, create_date FROM users")
                users = cur.fetchall()
                cur.close()
                return render_template('user_list.html', users=users)
            except Exception as e:
                flash(f"Error fetching user list: {e}")
                return render_template('user_list.html', users=[])

        @app.route('/delete_user/<user_id>', methods=['POST'])
        def delete_user(user_id):
            try:
                cur = self.mysql.connection.cursor()
                cur.execute("DELETE FROM users WHERE user_id = %s", [user_id])
                self.mysql.connection.commit()
                cur.close()
                flash("User deleted successfully.")
            except Exception as e:
                flash(f"Error deleting user: {e}")
            return redirect(url_for('user_list'))

    def run(self):
        self.app.run(debug=True)

if __name__ == '__main__':
    app = FlaskApp()
    app.run()