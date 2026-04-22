CREATE DATABASE IF NOT EXISTS littlelink;
USE littlelink;

CREATE TABLE IF NOT EXISTS links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  category VARCHAR(100),
  icon_class VARCHAR(100),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO links (name, url, category, icon_class, sort_order) VALUES
  ('LittleLink', 'https://littlelink.io', 'social', 'button-default', 1),
  ('GitHub', 'https://github.com', 'social', 'button-github', 2),
  ('Twitter/X', 'https://x.com', 'social', 'button-x', 3),
  ('YouTube', 'https://youtube.com', 'social', 'button-yt', 4),
  ('LinkedIn', 'https://linkedin.com', 'social', 'button-linked', 5);
