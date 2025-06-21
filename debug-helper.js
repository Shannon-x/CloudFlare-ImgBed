// 调试辅助脚本
// 用于分析CloudFlare ImgBed的常见问题

console.log("=== CloudFlare ImgBed 问题诊断脚本 ===\n");

// 常见问题和解决方案
const commonIssues = {
    "401 Unauthorized": {
        description: "认证失败",
        possibleCauses: [
            "1. 管理员用户名密码未设置或错误",
            "2. 环境变量 BASIC_USER 和 BASIC_PASS 未正确配置",
            "3. 前端认证token过期或无效",
            "4. Authorization header格式不正确"
        ],
        solutions: [
            "检查 wrangler.toml 中的 BASIC_USER 和 BASIC_PASS 设置",
            "确保 KV 数据库 img_url 已正确绑定",
            "清除浏览器缓存和cookies，重新登录",
            "检查网络请求是否包含正确的 Authorization header"
        ]
    },
    "404 Not Found": {
        description: "文件未找到",
        possibleCauses: [
            "1. 文件ID在KV数据库中不存在",
            "2. 文件存储渠道(R2/S3/Telegram)配置错误",
            "3. 文件路径解码问题",
            "4. 存储服务连接失败"
        ],
        solutions: [
            "检查 KV 数据库中是否存在该文件记录",
            "验证 R2/S3 存储配置和权限",
            "检查文件ID格式是否正确",
            "确认存储服务可访问性"
        ]
    },
    "Invalid header": {
        description: "HTTP Header中包含非ASCII字符",
        possibleCauses: [
            "1. UploadAddress 字段包含中文字符",
            "2. R2/S3 metadata包含Unicode字符",
            "3. Headers.set() 传入了包含中文的JSON字符串"
        ],
        solutions: [
            "已修复：使用 encodeURIComponent 编码地址信息",
            "已修复：R2/S3存储使用安全的metadata副本",
            "确保所有HTTP header值都是ASCII字符"
        ]
    }
};

// 环境检查清单
const environmentChecklist = [
    "✓ KV 数据库 (img_url) 已绑定",
    "✓ R2 存储 (img_r2) 已配置（如使用R2）",
    "✓ 认证信息 BASIC_USER/BASIC_PASS 已设置",
    "✓ S3 配置信息已正确填写（如使用S3）",
    "✓ Telegram Bot配置已完成（如使用TG）",
    "✓ 域名和URL前缀配置正确"
];

// 输出诊断信息
Object.entries(commonIssues).forEach(([issue, info]) => {
    console.log(`❌ ${issue}`);
    console.log(`   ${info.description}\n`);
    
    console.log("   可能原因：");
    info.possibleCauses.forEach(cause => console.log(`     ${cause}`));
    
    console.log("\n   解决方案：");
    info.solutions.forEach(solution => console.log(`     • ${solution}`));
    
    console.log("\n" + "=".repeat(60) + "\n");
});

console.log("📋 环境配置检查清单：\n");
environmentChecklist.forEach(item => console.log(`  ${item}`));

console.log("\n💡 快速修复步骤：");
console.log("1. 检查 wrangler.toml 配置文件");
console.log("2. 重新构建并启动容器: docker-compose up --build");
console.log("3. 清除浏览器缓存并重新登录");
console.log("4. 检查存储服务连接状态");
console.log("5. 查看完整错误日志进行进一步诊断"); 