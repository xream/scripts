/**
 * AI 脚本
 *
 * 说明: https://t.me/zhetengsha/5277
 *
 * 欢迎加入 Telegram 群组 https://t.me/zhetengsha
 */
async function operator(proxies = [], targetPlatform, context) {
    const $ = $substore;
    const {
        timeout = 30000, // 请求超时时间, 单位毫秒
        url = '', // 完整 OpenAI 兼容的 API URL, 例如: https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
        model = '', // 模型名称, 例如: gpt-5.4, models/gemini-3.1-flash-lite-preview
        key = '', // API Key
        // 用来参数的格式, 例如: 🇺🇸 US [VLESS] 01
        // 甚至可以让它排序和去除无效节点...总之是个优化提示词的活儿了, 例如:
        // "国家地区 Emoji" "ISO 3166-1 alpha-2" ["协议类型"] "分组内的序号"\n\n 去除无效节点 并 合理排序
        nameExample = '',
        fields = '', // 附加的字段, 比如想要包含类型, 就填 type. 多个字段用逗号分隔
        cache = false, // 是否启用缓存
    } = $arguments || {};

    const proxyNamesArray = proxies.map((p, i) => {
        const obj = { id: `${i}`, name: p.name };
        fields
            .split(/,|，/g)
            .map((i) => i.trim())
            .filter((i) => i.length > 0)
            .forEach((field) => {
                if (p[field]) {
                    obj[field] = p[field];
                }
            });
        return obj;
    });
    const proxyNamesStr = JSON.stringify(proxyNamesArray);
    const content = `
你将收到一个 JSON 数组字符串

任务：
按照以下规则转换每个对象的 "name" 字段：
${nameExample}

输入：
${proxyNamesStr}

输出要求：
1. 只返回 JSON 数组字符串
2. 每个对象仅保留 "name" 和 "id" 字段
3. 不允许输出任何 JSON 之外的内容
4. 输出必须是合法 JSON(可被 JSON.parse 解析）

输出示例格式：
[
  { "name": "...", "id": "..." },
  { "name": "...", "id": "..." }
]
`;
    let result = [];
    const cacheStr = JSON.stringify({ ...$arguments, content, proxyNamesStr });
    const cacheId = ProxyUtils.hex_md5
        ? ProxyUtils.hex_md5(cacheStr)
        : cacheStr; // 尝试使用 hex_md5 生成 cacheId, 如果不可用则使用字符串本身
    const cached = scriptResourceCache.get(cacheId);
    if (cache && cached) {
        $.info('使用缓存结果');
        result = JSON.parse(cached);
    } else {
        $.info('发送请求到 OpenAI 兼容接口...');
        const { statusCode, body } = await $.http.post({
            timeout,
            url,
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'user',
                        content,
                    },
                ],
            }),
        });
        $.info(`状态码: ${statusCode}`);
        $.info(`响应内容: ${body}`);

        result = JSON.parse(
            (JSON.parse(body)?.choices?.[0]?.message?.content || '[]')
                .replace(/^```json/i, '')
                .replace(/```$/, ''),
        );
        // $.info(`结果: ${result}`);
        if (cache) {
            scriptResourceCache.set(cacheId, JSON.stringify(result));
        }
    }

    return result.map((item) => {
        const proxy = proxies.find((p, i) => item.id === `${i}`);
        return {
            ...proxy,
            name: item.name,
        };
    });
}
