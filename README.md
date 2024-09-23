# 概要
Google Classroomの投稿内容をGoogle API Service(GAS)を使って取得し、DiscordのWebhookに送信します。

1. GASからDiscord Webhookへ送信する。
    * 本プログラムでは、別途ウェブサーバーを用意して、Classroomでの投稿内容を逐一記録している。そうすることで、二重送信や送信忘れを防ぐことができる。
        * 実際、GASを時間主導型で送信すると、GASの実行時間のばらつきからうまくいかないことが多々ある。
        * もちろん、Spreadsheetを使って、送信したかどうかを記録することは可能である。
        * その場合、`Course_Id`と`Post_Id`をキーにするとよい。
2. PHP->PDOを使ってSQLに逐一記録する。
    * 登録された投稿を確認して、登録されていなければ、新規登録するとともに、Webhookに送信する。

## 設定方法

[GASの設定](/README.md#gasの設定)以降は[概要](/README.md#概要)で述べたように任意である。

### GASの設定
1. 取得したいGoogle ClassroomのGoogleアカウントでSpreadsheetを新規作成します。
2. Spreadsheetを開いて`拡張機能`>`App Script`と進みます。
3. `ファイル`の`+`ボタンを押して[main.js](/scr/main.js)を張り付ける。
4. `サービス`から`Google Classroom`を追加する。

* トリガーを追加する場合
    1. `トリガー`から`トリガーを作成`
    2. 下の画像のように入力する。
    ![image.png](/img/image.png)


### Apacheのインストール
```shell
$ apt update
$ apt install apache2
```
* 詳しくは`Apache2 install`などで調べてください。

`/var/www/html`などにノーマルHTMLフォルダが作成されるので、[main.php](/scr/main.php)をコピーする。

* ドメインがある場合は設定するとよい。

### PHPのインストール
```shell
$ apt install php
```

### MariaDBの設定

1. MariaDBのインストール
```shell
$ apt install mariadb-server
```

2. 新規ユーザー作成
```sql
MariaDB [(none)]> GRANT ALL PRIVILEGES ON <new user>.* TO '<new use>'@'localhost' IDENTIFIED BY '<mariadb user password>';
MariaDB [(none)]> exit;
```

3. MySQLのタイムゾーン設定(Optional)
```shell
$ mariadb-tzinfo-to-sql /usr/share/zoneinfo
```

[main.php](/scr/main.php)で時刻を使います。設定しなくても動きます。

4. データベース作成(既存のものを使いたい場合はスキップ)
```sql
MariaDB [(none)]> CREATE DATABASE classroom DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_general_ci;
```
* 英数のみを使うので文字コードは正直なんでもいいが、`utf8mb4`に設定。

5. テーブル作成
```sql
CREATE TABLE <Your Database>.classroom (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    Course_id VARCHAR(100), 
    Post_id VARCHAR(100), 
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```