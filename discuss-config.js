/* ==========================================================================
   discuss-config.js — 留言讨论板块的 giscus 配置
   --------------------------------------------------------------------------
   本站为纯静态站点（无后端）。讨论区使用 giscus：评论数据全部存储在
   GitHub Discussions 中，由 GitHub 负责账号登录、防垃圾与审核，服务器
   零额外负担。按 DISCUSS_SETUP.md 完成三步配置后：

     1. 把 enabled 改为 true
     2. 填入 repoId 与 categoryId（在 https://giscus.app/zh-CN 生成）
     3. 重新部署

   未启用时，页面会自动显示「前往 GitHub Discussions」的兜底入口。
   ========================================================================== */
window.DISCUSS_CONFIG = {
  /* ---- 已启用（2026-09-06，仓库 Gsaecy/hongyuguo.com，分类「留言讨论」） ---- */
  enabled: true,

  /* 存放讨论的公开仓库（giscus app 已安装） */
  repo: 'Gsaecy/hongyuguo.com',
  repoId: 'R_kgDOUHyw8A',
  category: '留言讨论Comments', // 公告类型：只有维护者与 giscus 能新建讨论
  categoryId: 'DIC_kwDOUHyw8M4DE-Yy',

  /* 页面 ↔ 讨论映射：每个话题用 slug 作为「特定字符串」匹配
     首次有人评论时 giscus 会自动创建对应 discussion */
  mapping: 'specific',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top', // 评论框在评论上方，无需滚动即可留言

  /* 显示语言与主题（主题已按网站奶油底 + 橙色定制，本地预览自动回退 light） */
  lang: 'zh-CN',
  theme: 'https://hongyuguo.com/assets/giscus/theme.css',
  fallbackTheme: 'light',

  /* 未启用 giscus 时的兜底入口 */
  discussionsUrl: 'https://github.com/Gsaecy/hongyuguo.com/discussions',
};
