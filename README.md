# Event Board - イベント募集サービス

動的なWebページを使用したイベント募集・参加管理サービスです。

## 機能

- **ユーザー認証**: ユーザー登録とログイン機能
- **イベント表示**: トップ画面でイベントをカード形式で表示
- **イベント検索**: イベント名や説明で検索可能
- **イベント作成**: ログインユーザーが新しいイベントを作成
- **イベント参加**: ユーザーがイベントに参加登録
- **参加者管理**: イベント詳細で参加メンバー情報を表示
- **参加キャンセル**: 参加したイベントから脱退可能

## 技術スタック

- **バックエンド**: Python Flask
- **データベース**: PostgreSQL with SQLAlchemy ORM
- **フロントエンド**: HTML, CSS, JavaScript
- **認証**: パスワードハッシュ化 (werkzeug.security)
- **環境管理**: python-dotenv

## ディレクトリ構成

```
event-board/
├── app.py                  # Flask アプリケーションメイン
├── requirements.txt        # Python依存パッケージ
├── .env.example           # 環境変数テンプレート
├── templates/
│   ├── index.html         # ホームページ
│   ├── login.html         # ログインページ
│   ├── register.html      # 登録ページ
│   └── create_event.html  # イベント作成ページ
└── static/
    ├── css/
    │   └── style.css      # スタイルシート
    └── js/
        ├── main.js        # メイン JavaScript
        ├── auth.js        # 認証関連 JavaScript
        └── create_event.js # イベント作成 JavaScript
```

## セットアップ手順

### 1. PostgreSQL のインストールと設定

PostgreSQL がインストールされていることを確認してください。

```bash
# PostgreSQL サーバーの起動
# macOS (Homebrew)
brew services start postgresql

# Linux (systemd)
sudo systemctl start postgresql

# Windows
# PostgreSQL インストール時に設定されたサービスを起動
```

### 2. データベースの作成

```bash
# psql にログイン
psql -U postgres

# データベース作成
CREATE DATABASE event_board;

# ユーザー作成（オプション）
CREATE USER event_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE event_board TO event_user;

# psql を終了
\q
```

### 3. リポジトリをクローン

```bash
git clone https://github.com/maosasa/event-board.git
cd event-board
```

### 4. 環境変数ファイルを作成

```bash
# .env.example をコピーして .env を作成
cp .env.example .env
```

`.env` ファイルを編集して、PostgreSQL接続情報を設定：

```env
# Database Configuration
DATABASE_URL=postgresql://event_user:your_password@localhost:5432/event_board

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-change-in-production

# Server Configuration
FLASK_DEBUG=True
```

### 5. 仮想環境を作成

```bash
python -m venv venv

# Windowsの場合
venv\Scripts\activate

# macOS/Linuxの場合
source venv/bin/activate
```

### 6. 依存パッケージをインストール

```bash
pip install -r requirements.txt
```

### 7. アプリケーションを実行

```bash
python app.py
```

ブラウザで `http://localhost:5000` にアクセスしてください。

## 使用方法

### ユーザー登録

1. 「登録」ボタンをクリック
2. ユーザー名、メールアドレス、パスワードを入力
3. 「登録」ボタンをクリック

### ログイン

1. 「ログイン」ボタンをクリック
2. ユーザー名とパスワードを入力
3. 「ログイン」ボタンをクリック

### イベント作成

1. ログイン後、「イベント作成」をクリック
2. イベント情報を入力
   - イベント名
   - 説明
   - 場所
   - 日時
   - 最大参加人数（オプション）
3. 「イベントを作成」ボタンをクリック

### イベント参加

1. ホームページでイベントカードをクリック
2. イベント詳細を確認
3. 「イベントに参加」ボタンをクリック

## API エンドポイント

### 認証

- `POST /register` - ユーザー登録
- `POST /login` - ログイン
- `GET /logout` - ログアウト

### イベント

- `GET /api/events` - 全イベント取得
- `GET /api/events/<id>` - イベント詳細取得
- `POST /api/events` - イベント作成（要認証）
- `POST /api/events/<id>/join` - イベント参加（要認証）
- `POST /api/events/<id>/leave` - イベント脱退（要認証）

### ユーザー

- `GET /api/user/status` - ユーザーステータス取得

## データモデル

### User

- `id`: ユーザーID
- `username`: ユーザー名
- `email`: メールアドレス
- `password_hash`: パスワードハッシュ
- `created_at`: 作成日時

### Event

- `id`: イベントID
- `title`: イベント名
- `description`: 説明
- `location`: 開催場所
- `event_date`: イベント日時
- `creator_id`: 作成者ID
- `max_participants`: 最大参加人数
- `created_at`: 作成日時
- `updated_at`: 更新日時

### EventParticipant

- `id`: 参加ID
- `event_id`: イベントID
- `user_id`: ユーザーID
- `joined_at`: 参加日時

## トラブルシューティング

### PostgreSQL 接続エラー

```
sqlalchemy.exc.OperationalError: could not translate host name "localhost" to address
```

**解決方法:**
- PostgreSQL サーバーが起動していることを確認
- DATABASE_URL の接続情報が正しいことを確認
- ファイアウォール設定を確認

### モジュールが見つからない

```
ModuleNotFoundError: No module named 'psycopg2'
```

**解決方法:**
```bash
pip install -r requirements.txt
```

## セキュリティに関する注意

本アプリケーションは開発用です。本番環境での使用前に以下の対策を講じてください：

1. `SECRET_KEY` を強力なランダム値に変更
2. `FLASK_ENV` を本番用に変更（`production`）
3. HTTPSの有効化
4. CSRF保護の実装
5. パスワード検証の強化
6. SQLインジェクション対策の確認
7. `.env` ファイルを `.gitignore` に追加
8. データベースユーザーのパスワードを強力なものに設定

## ライセンス

MIT License

## 作成者

maosasa
