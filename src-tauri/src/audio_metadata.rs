use lofty::prelude::*;
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::command;
// 添加 base64 引擎导入
use base64::{engine::general_purpose::STANDARD, Engine as _};

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
    let path = Path::new(&full_path);

    // 读取音频文件
    let tagged_file = match lofty::read_from_path(path) {
        Ok(file) => file,
        Err(e) => return Err(format!("无法读取音频文件: {}", e)),
    };

    // 获取音频属性
    let properties = tagged_file.properties();

    let tag = match tagged_file.primary_tag() {
        Some(primary_tag) => primary_tag,
        None => tagged_file.first_tag().expect("ERROR: No tags found!"),
    };

    // 添加封面数据 - 使用新的 base64 编码方法
    let (cover_data, cover_mime_type) = match _get_picture_by_lofty(&full_path) {
        Some((data, mime_type)) => {
            // 使用 STANDARD.encode 替代已弃用的 base64::encode
            (Some(STANDARD.encode(data)), Some(mime_type))
        }
        None => (None, None),
    };

    // 提取标签信息 - 修复闭包参数问题
    let title = match tag.title().as_deref().unwrap_or("None") {
        "None" => "未知标题".to_string(),
        artist => artist.to_string(),
    };

    let artist = match tag.artist().as_deref().unwrap_or("None") {
        "None" => "未知艺术家".to_string(),
        artist => artist.to_string(),
    };

    let album = match tag.album().as_deref().unwrap_or("None") {
        "None" => "未知专辑".to_string(),
        album => album.to_string(),
    };

    let duration = properties.duration().as_secs_f64() * 1000.0;

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
    if let Ok(tagged_file) = lofty::read_from_path(&path) {
        let tag = tagged_file
            .primary_tag()
            .or_else(|| tagged_file.first_tag())?;

        // 获取第一个图片并返回数据和MIME类型
        if let Some(picture) = tag.pictures().first() {
            // 修复：使用正确的方式获取MIME类型的字符串表示
            let mime_type_str = match picture.mime_type() {
                Some(mime) => format!("{mime}"), // 使用格式化字符串而不是to_string()
                None => "image/jpeg".to_string(), // 默认MIME类型
            };

            return Some((picture.data().to_vec(), mime_type_str));
        }
    }

    None
}
