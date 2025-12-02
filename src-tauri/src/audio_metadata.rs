use lofty::prelude::*;
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::command;
// 添加 base64 引擎导入
use base64::{engine::general_purpose::STANDARD, Engine as _};

// 安全地提取字符串的辅助函数，支持 &str 和 Cow<str>
fn safe_extract_string<T: AsRef<str>>(option_str: Option<T>, default: &str) -> String {
    match option_str {
        Some(s) => {
            let trimmed = s.as_ref().trim();
            if !trimmed.is_empty() && trimmed != "None" {
                // 安全地处理可能包含无效UTF-8的字节序列
                String::from_utf8_lossy(trimmed.as_bytes()).to_string()
            } else {
                default.to_string()
            }
        }
        None => default.to_string(),
    }
}

// 从文件名中提取歌曲名和歌手信息
fn extract_title_and_artist_from_filename(file_name: &str) -> (String, String) {
    // 移除文件扩展名
    let name_without_ext = match file_name.rfind('.') {
        Some(dot_pos) => &file_name[..dot_pos],
        None => file_name,
    };

    // 尝试匹配 "歌曲名-歌手" 格式
    if let Some(dash_pos) = name_without_ext.find('-') {
        let title_part = name_without_ext[..dash_pos].trim();
        let artist_part = name_without_ext[dash_pos + 1..].trim();
        
        // 确保两部分都不为空
        if !title_part.is_empty() && !artist_part.is_empty() {
            return (title_part.to_string(), artist_part.to_string());
        }
    }

    // 如果没有找到分隔符，尝试匹配 "歌手-歌曲名" 格式
    if let Some(dash_pos) = name_without_ext.rfind('-') {
        let artist_part = name_without_ext[..dash_pos].trim();
        let title_part = name_without_ext[dash_pos + 1..].trim();
        
        if !title_part.is_empty() && !artist_part.is_empty() {
            return (title_part.to_string(), artist_part.to_string());
        }
    }

    // 如果都失败了，使用整个文件名作为标题
    (name_without_ext.to_string(), "未知艺术家".to_string())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AudioMetadata {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration: f64,
    pub full_path: String,
    pub cover_data: Option<String>,
    pub cover_mime_type: Option<String>,
}

#[command]
pub fn get_audio_metadata(full_path: String) -> Result<AudioMetadata, String> {
    // 添加安全检查，确保路径不为空
    if full_path.trim().is_empty() {
        return Err("文件路径不能为空".to_string());
    }

    let path = Path::new(&full_path);

    // 检查文件是否存在
    if !path.exists() {
        return Err(format!("文件不存在: {}", full_path));
    }

    // 读取音频文件，添加更详细的错误处理
    let tagged_file = match lofty::read_from_path(path) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("读取音频文件失败 {}: {}", full_path, e);
            
            // 对于某些特定错误，尝试从文件名创建基本元数据
            let error_str = e.to_string();
            if error_str.contains("invalid sample frequency") || 
               error_str.contains("File contains an invalid") ||
               error_str.contains("unsupported") {
                eprintln!("尝试为 {} 从文件名创建基本元数据", full_path);
                
                // 从文件名提取歌曲名和歌手
                let file_name = Path::new(&full_path)
                    .file_name()
                    .and_then(|name| name.to_str())
                    .unwrap_or("未知文件");
                
                let (title, artist) = extract_title_and_artist_from_filename(file_name);
                
                return Ok(AudioMetadata {
                    title,
                    artist,
                    album: "未知专辑".to_string(),
                    duration: 0.0,
                    full_path,
                    cover_data: None,
                    cover_mime_type: None,
                });
            }
            
            return Err(format!("无法读取音频文件: {}", e));
        }
    };

    // 获取音频属性
    let properties = tagged_file.properties();

    // 安全地获取标签，避免 panic
    let tag = match tagged_file.primary_tag() {
        Some(primary_tag) => primary_tag,
        None => {
            match tagged_file.first_tag() {
                Some(t) => t,
                None => {
                    eprintln!("警告: 文件 {} 没有找到标签信息，使用文件名提取", full_path);
                    // 从文件名提取歌曲名和歌手
                    let file_name = Path::new(&full_path)
                        .file_name()
                        .and_then(|name| name.to_str())
                        .unwrap_or("未知文件");
                    
                    let (title, artist) = extract_title_and_artist_from_filename(file_name);
                    
                    // 安全地获取时长，避免无效值
                    let duration = {
                        let duration_secs = properties.duration().as_secs_f64();
                        if duration_secs.is_finite() && duration_secs > 0.0 {
                            duration_secs * 1000.0
                        } else {
                            0.0
                        }
                    };

                    // 添加封面数据 - 使用新的 base64 编码方法
                    let (cover_data, cover_mime_type) = match _get_picture_by_lofty(&full_path) {
                        Some((data, mime_type)) => {
                            (Some(STANDARD.encode(data)), Some(mime_type))
                        }
                        None => (None, None),
                    };

                    return Ok(AudioMetadata {
                        title,
                        artist,
                        album: "未知专辑".to_string(),
                        duration,
                        full_path,
                        cover_data,
                        cover_mime_type,
                    });
                }
            }
        }
    };

    // 添加封面数据 - 使用新的 base64 编码方法
    let (cover_data, cover_mime_type) = match _get_picture_by_lofty(&full_path) {
        Some((data, mime_type)) => {
            // 使用 STANDARD.encode 替代已弃用的 base64::encode
            (Some(STANDARD.encode(data)), Some(mime_type))
        }
        None => (None, None),
    };

    // 提取标签信息 - 使用更安全的字符串处理
    let title = safe_extract_string(tag.title(), "未知标题");
    let artist = safe_extract_string(tag.artist(), "未知艺术家");
    let album = safe_extract_string(tag.album(), "未知专辑");

    // 安全地获取时长，避免无效值
    let duration = {
        let duration_secs = properties.duration().as_secs_f64();
        if duration_secs.is_finite() && duration_secs > 0.0 {
            duration_secs * 1000.0
        } else {
            0.0
        }
    };

    Ok(AudioMetadata {
        title,
        artist,
        album,
        duration,
        full_path,
        cover_data,
        cover_mime_type,
    })
}

// 修改函数返回类型，同时返回图片数据和MIME类型
fn _get_picture_by_lofty(path: &String) -> Option<(Vec<u8>, String)> {
    // 添加安全检查
    if path.trim().is_empty() {
        return None;
    }

    // 使用更安全的文件读取方式
    let tagged_file = match lofty::read_from_path(&path) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("读取图片元数据失败 {}: {}", path, e);
            return None;
        }
    };

    let tag = match tagged_file.primary_tag() {
        Some(primary_tag) => primary_tag,
        None => match tagged_file.first_tag() {
            Some(t) => t,
            None => return None,
        },
    };

    // 安全地获取图片数据
    let pictures = tag.pictures();
    if pictures.is_empty() {
        return None;
    }

    // 获取第一个图片并返回数据和MIME类型
    if let Some(picture) = pictures.first() {
        // 检查图片数据是否为空
        let picture_data = picture.data();
        if picture_data.is_empty() {
            eprintln!("警告: 文件 {} 的图片数据为空", path);
            return None;
        }

        // 安全地获取MIME类型
        let mime_type_str = match picture.mime_type() {
            Some(mime) => {
                // 安全地转换为字符串
                let mime_str = format!("{mime}");
                if mime_str.is_empty() {
                    "image/jpeg".to_string()
                } else {
                    mime_str
                }
            }
            None => "image/jpeg".to_string(), // 默认MIME类型
        };

        // 克隆数据，避免生命周期问题
        let data = picture_data.to_vec();
        return Some((data, mime_type_str));
    }

    None
}
