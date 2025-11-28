use serde_json::Value;
use std::collections::HashMap;
use std::result::Result;

#[tauri::command]
pub async fn http_get_text(
    url: &str,
    header: HashMap<String, String>,
    req_body: Option<HashMap<String, Value>>,
) -> Result<String, String> {
    // 创建HTTP客户端
    let client = reqwest::Client::new();
    // 创建请求
    let mut request = client.get(url);

    // 添加查询参数 - 只有当req_body存在时才处理
    if let Some(body) = req_body {
        for (key, value) in &body {
            // 将任何类型的值转换为字符串
            let value_str = match value {
                Value::String(s) => s.to_string(),
                Value::Number(n) => n.to_string(),
                Value::Bool(b) => b.to_string(),
                _ => value.to_string(), // 对于其他类型，使用JSON字符串表示
            };
            request = request.query(&[(key, value_str)]);
        }
    }

    // 添加请求头
    for (key, value) in header {
        request = request.header(key, value);
    }

    // 发送请求
    match request.send().await {
        Ok(response) => {
            // 检查响应状态
            if response.status().is_success() {
                // 使用text_with_charset确保中文正确显示
                match response.text_with_charset("utf-8").await {
                    Ok(text) => Ok(text), // 直接返回文本
                    Err(e) => {
                        eprintln!("读取响应失败: {}", e);
                        Err(format!("读取响应失败: {}", e))
                    }
                }
            } else {
                Err(format!("请求失败，状态码: {}", response.status()))
            }
        }
        Err(e) => {
            eprintln!("发送请求失败: {}", e);
            Err(format!("发送请求失败: {}", e))
        }
    }
}

#[tauri::command]
pub async fn http_post_text(
    url: &str,
    header: HashMap<String, String>,
    req_body: Option<HashMap<String, Value>>,
) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut request = client.post(url);
    // 添加请求头
    for (key, value) in header {
        request = request.header(key, value);
    }
    // 添加查询参数 - 只有当req_body存在时才处理
    if let Some(body) = req_body {
        for (key, value) in &body {
            // 将任何类型的值转换为字符串
            let value_str = match value {
                Value::String(s) => s.to_string(),
                Value::Number(n) => n.to_string(),
                Value::Bool(b) => b.to_string(),
                _ => value.to_string(), // 对于其他类型，使用JSON字符串表示
            };
            request = request.query(&[(key, value_str)]);
        }
    }
    // 发送请求
    match request.send().await {
        Ok(response) => {
            // 检查响应状态
            if response.status().is_success() {
                // 使用text_with_charset确保中文正确显示
                match response.text_with_charset("utf-8").await {
                    Ok(text) => Ok(text), // 直接返回文本
                    Err(e) => {
                        eprintln!("读取响应失败: {}", e);
                        Err(format!("读取响应失败: {}", e))
                    }
                }
            } else {
                Err(format!("请求失败，状态码: {}", response.status()))
            }
        }
        Err(e) => {
            eprintln!("发送请求失败: {}", e);
            Err(format!("发送请求失败: {}", e))
        }
    }
}
