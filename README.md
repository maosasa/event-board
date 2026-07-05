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
- **データベース**: SQLAlchemy (SQLite)
- **フロントエンド**: HTML, CSS, JavaScript
- **認証**: パスワードハッシュ化 (werkzeug.security)

## ディレクトリ構成

```
event-board/
├── app.py                  # Flask アプリケーションメイン
├── requirements.txt        # Python依存パッケージ
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

### 1. リポジトリをクローン

```bash
git clone https://github.com/maosasa/event-board.git
cd event-board
```

### 2. 仮想環境を作成

```bash
python -m venv venv

# Windowsの場合
venv\Scripts\activate

# macOS/Linuxの場合
source venv/bin/activate
```

### 3. 依存パッケージをインストール

```bash
pip install -r requirements.txt
```

### 4. アプリケーションを実行

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

## セキュリティに関する注意

本アプリケーションは開発用です。本番環境での使用前に以下の対策を講じてください：

1. `SECRET_KEY` を強力なランダム値に変更
2. データベースを本番用（PostgreSQL等）に変更
3. HTTPSの有効化
4. CSRF保護の実装
5. パスワード検証の強化
6. SQLインジェクション対策の確認

## ライセンス

MIT License

## 作成者

maosasa
