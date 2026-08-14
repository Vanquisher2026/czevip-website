// CZEVIP Admin i18n: EN + ZH dictionaries, runtime translation via data-i18n.
// Persists preference in localStorage; default EN.

(function () {
  'use strict';

  const STRINGS = {
    en: {
      // Brand + nav
      'brand': 'CZEVIP',
      'brand.sub': 'Admin Console',
      'nav.dashboard': 'Dashboard',
      'nav.inquiries': 'Inquiries',
      'nav.products': 'Products',
      'nav.viewSite': 'View site',
      'nav.signOut': 'Sign out',

      // Login
      'login.title': 'Sign in',
      'login.password': 'Password',
      'login.submit': 'Sign in',
      'login.signingIn': 'Signing in...',
      'login.failed': 'Sign-in failed',
      'login.hint': 'Default dev password: czevip-admin. Set ADMIN_PASSWORD in Cloudflare Pages env vars for production.',

      // Dashboard
      'dash.title': 'Dashboard',
      'dash.sub': 'Overview of inquiries and catalog',
      'dash.inqTotal': 'Inquiries total',
      'dash.unread': 'unread',
      'dash.oemInq': 'OEM inquiries',
      'dash.oemMeta': 'Manufacturing inquiries',
      'dash.partnerInq': 'Creator applications',
      'dash.partnerMeta': 'Influencer applications',
      'dash.products': 'Products',
      'dash.activeOf': 'active / inactive',
      'dash.recent': 'Recent inquiries',
      'dash.viewAll': 'View all',
      'dash.quickActions': 'Quick actions',
      'dash.quickDesc': 'Common tasks.',
      'dash.addProduct': 'Add product',
      'dash.reviewInq': 'Review inquiries',
      'dash.seed': 'Seed D1 from products.json',
      'dash.seedHint': 'Seeding is idempotent. Use once when D1 is empty so existing products can be managed.',
      'dash.noInq': 'No inquiries yet.',
      'dash.failedStats': 'Failed to load stats',
      'dash.seeded': 'Seeded {n} products (skipped {s})',

      // Inquiries
      'inq.title': 'Inquiries',
      'inq.totalLine': '{n} total',
      'inq.allKinds': 'All kinds',
      'inq.kindContact': 'Contact',
      'inq.kindOem': 'OEM',
      'inq.kindPartner': 'Partner',
      'inq.allStatus': 'All status',
      'inq.statusNew': 'New',
      'inq.statusRead': 'Read',
      'inq.statusReplied': 'Replied',
      'inq.statusArchived': 'Archived',
      'inq.colWhen': 'When',
      'inq.colKind': 'Kind',
      'inq.colName': 'Name',
      'inq.colEmail': 'Email',
      'inq.colStatus': 'Status',
      'inq.empty': 'No inquiries match.',
      'inq.loading': 'Loading...',
      'inq.view': 'View',
      'inq.updated': 'Updated to {s}',
      'inq.modalTitle': 'Inquiry #{id}',
      'inq.payload': 'Payload',
      'inq.replyByEmail': 'Reply by email',
      'inq.close': 'Close',
      'inq.submitted': 'Submitted',
      'inq.ip': 'IP',

      // Products
      'prod.title': 'Products',
      'prod.loading': 'Loading...',
      'prod.addProduct': 'Add product',
      'prod.seed': 'Seed from products.json',
      'prod.allInclInactive': 'All (incl. inactive)',
      'prod.activeOnly': 'Active only',
      'prod.totalAll': '{n} products (incl. inactive)',
      'prod.totalActive': '{n} products',
      'prod.colId': 'ID',
      'prod.colName': 'Name',
      'prod.colCat': 'Cat',
      'prod.colPrice': 'Price',
      'prod.colBadge': 'Badge',
      'prod.colFlags': 'Flags',
      'prod.colStatus': 'Status',
      'prod.empty': 'No products yet. Use Add product or Seed from products.json.',
      'prod.featured': 'featured',
      'prod.new': 'new',
      'prod.active': 'active',
      'prod.inactive': 'inactive',
      'prod.edit': 'Edit',
      'prod.archive': 'Archive',
      'prod.duplicate': 'Duplicate',
      'prod.archiveConfirm': 'Archive {id}? It will be hidden from the site but kept in D1.',
      'prod.archived': 'Archived',
      'prod.archiveFailed': 'Archive failed',
      'prod.loadFailed': 'Load failed',
      'prod.saved': 'Saved',
      'prod.created': 'Created',
      'prod.saveFailed': 'Save failed',

      // Editor
      'edit.newProduct': 'New product',
      'edit.editProduct': 'Edit {name}',
      'edit.field.id': 'ID',
      'edit.field.slug': 'Slug',
      'edit.field.name': 'Name',
      'edit.field.color': 'Color',
      'edit.field.cat': 'Category',
      'edit.field.price': 'Price (USD)',
      'edit.field.compareAt': 'Compare-at',
      'edit.field.material': 'Material',
      'edit.field.origin': 'Origin',
      'edit.field.weight': 'Weight (lb)',
      'edit.field.badge': 'Badge',
      'edit.field.mpn': 'MPN',
      'edit.field.sizes': 'Sizes (comma-separated)',
      'edit.field.colors': 'Colors (comma-separated)',
      'edit.field.primaryImage': 'Primary image',
      'edit.field.images': 'Other images (comma-separated)',
      'edit.field.desc': 'Description',
      'edit.field.availability': 'Availability',
      'edit.field.condition': 'Condition',
      'edit.field.gtin': 'GTIN',
      'edit.field.featured': 'Featured',
      'edit.field.new': 'Marked as new',
      'edit.field.active': 'Active (visible on site)',
      'edit.cancel': 'Cancel',
      'edit.create': 'Create product',
      'edit.save': 'Save changes',
      'edit.upload': 'Upload image',
      'edit.uploading': 'Uploading...',

      // Bulk
      'bulk.selected': '{n} selected',
      'bulk.clear': 'Clear',
      'bulk.action': 'Bulk action',
      'bulk.setPrice': 'Set price',
      'bulk.adjustPrice': 'Adjust by %',
      'bulk.setBadge': 'Set badge',
      'bulk.clearBadge': 'Clear badge',
      'bulk.setAvail': 'Set availability',
      'bulk.archive': 'Archive selected',
      'bulk.apply': 'Apply',
      'bulk.applied': 'Updated {n} products',
      'bulk.failed': 'Bulk update failed',
      'bulk.pickAction': 'Pick an action',

      // Common
      'common.confirm': 'Confirm',
      'common.cancel': 'Cancel',
      'common.close': 'Close',
      'common.yes': 'Yes',
      'common.no': 'No',

      // Language toggle
      'lang.toggle': 'EN / 中文'
    },
    zh: {
      'brand': 'CZEVIP',
      'brand.sub': '后台管理',
      'nav.dashboard': '仪表板',
      'nav.inquiries': '询盘',
      'nav.products': '产品',
      'nav.viewSite': '访问前台',
      'nav.signOut': '退出登录',

      'login.title': '登录',
      'login.password': '密码',
      'login.submit': '登录',
      'login.signingIn': '登录中...',
      'login.failed': '登录失败',
      'login.hint': '本地默认密码 czevip-admin。生产环境请在 Cloudflare Pages 环境变量中设置 ADMIN_PASSWORD。',

      'dash.title': '仪表板',
      'dash.sub': '询盘与产品总览',
      'dash.inqTotal': '询盘总数',
      'dash.unread': '未读',
      'dash.oemInq': 'OEM 询盘',
      'dash.oemMeta': '代工合作意向',
      'dash.partnerInq': '达人申请',
      'dash.partnerMeta': '网红合作申请',
      'dash.products': '产品',
      'dash.activeOf': '在售 / 已下架',
      'dash.recent': '最新询盘',
      'dash.viewAll': '查看全部',
      'dash.quickActions': '快捷操作',
      'dash.quickDesc': '常用功能。',
      'dash.addProduct': '新增产品',
      'dash.reviewInq': '查看询盘',
      'dash.seed': '从 products.json 初始化 D1',
      'dash.seedHint': '幂等操作。仅在 D1 为空时执行，用于把现有产品导入到后台。',
      'dash.noInq': '暂无询盘。',
      'dash.failedStats': '加载统计失败',
      'dash.seeded': '已导入 {n} 个产品（跳过 {s}）',

      'inq.title': '询盘',
      'inq.totalLine': '共 {n} 条',
      'inq.allKinds': '全部类型',
      'inq.kindContact': '联系',
      'inq.kindOem': '代工',
      'inq.kindPartner': '达人',
      'inq.allStatus': '全部状态',
      'inq.statusNew': '新',
      'inq.statusRead': '已读',
      'inq.statusReplied': '已回复',
      'inq.statusArchived': '已归档',
      'inq.colWhen': '时间',
      'inq.colKind': '类型',
      'inq.colName': '姓名',
      'inq.colEmail': '邮箱',
      'inq.colStatus': '状态',
      'inq.empty': '没有匹配的询盘。',
      'inq.loading': '加载中...',
      'inq.view': '查看',
      'inq.updated': '已更新为 {s}',
      'inq.modalTitle': '询盘 #{id}',
      'inq.payload': '内容',
      'inq.replyByEmail': '邮件回复',
      'inq.close': '关闭',
      'inq.submitted': '提交时间',
      'inq.ip': 'IP',

      'prod.title': '产品',
      'prod.loading': '加载中...',
      'prod.addProduct': '新增产品',
      'prod.seed': '从 products.json 初始化',
      'prod.allInclInactive': '全部（含已下架）',
      'prod.activeOnly': '仅在售',
      'prod.totalAll': '{n} 个产品（含已下架）',
      'prod.totalActive': '{n} 个产品',
      'prod.colId': 'ID',
      'prod.colName': '名称',
      'prod.colCat': '分类',
      'prod.colPrice': '价格',
      'prod.colBadge': '标签',
      'prod.colFlags': '标记',
      'prod.colStatus': '状态',
      'prod.empty': '暂无产品。请点击"新增产品"或"从 products.json 初始化"。',
      'prod.featured': '精选',
      'prod.new': '新品',
      'prod.active': '在售',
      'prod.inactive': '已下架',
      'prod.edit': '编辑',
      'prod.archive': '下架',
      'prod.duplicate': '复制',
      'prod.archiveConfirm': '确认下架 {id}？产品会从前台隐藏，但保留在 D1 中。',
      'prod.archived': '已下架',
      'prod.archiveFailed': '下架失败',
      'prod.loadFailed': '加载失败',
      'prod.saved': '已保存',
      'prod.created': '已创建',
      'prod.saveFailed': '保存失败',

      'edit.newProduct': '新增产品',
      'edit.editProduct': '编辑 {name}',
      'edit.field.id': 'ID',
      'edit.field.slug': 'Slug',
      'edit.field.name': '名称',
      'edit.field.color': '颜色',
      'edit.field.cat': '分类',
      'edit.field.price': '价格（美元）',
      'edit.field.compareAt': '对比价',
      'edit.field.material': '材质',
      'edit.field.origin': '产地',
      'edit.field.weight': '重量（磅）',
      'edit.field.badge': '标签',
      'edit.field.mpn': 'MPN',
      'edit.field.sizes': '尺码（逗号分隔）',
      'edit.field.colors': '颜色（逗号分隔）',
      'edit.field.primaryImage': '主图',
      'edit.field.images': '其他图片（逗号分隔）',
      'edit.field.desc': '描述',
      'edit.field.availability': '库存状态',
      'edit.field.condition': '成色',
      'edit.field.gtin': 'GTIN',
      'edit.field.featured': '精选',
      'edit.field.new': '标记为新品',
      'edit.field.active': '在售（前台可见）',
      'edit.cancel': '取消',
      'edit.create': '创建产品',
      'edit.save': '保存修改',
      'edit.upload': '上传图片',
      'edit.uploading': '上传中...',

      'bulk.selected': '已选 {n} 项',
      'bulk.clear': '清空',
      'bulk.action': '批量操作',
      'bulk.setPrice': '设置价格',
      'bulk.adjustPrice': '按百分比调整',
      'bulk.setBadge': '设置标签',
      'bulk.clearBadge': '清空标签',
      'bulk.setAvail': '设置库存',
      'bulk.archive': '批量下架',
      'bulk.apply': '应用',
      'bulk.applied': '已更新 {n} 个产品',
      'bulk.failed': '批量操作失败',
      'bulk.pickAction': '请选择操作',

      'common.confirm': '确认',
      'common.cancel': '取消',
      'common.close': '关闭',
      'common.yes': '是',
      'common.no': '否',

      'lang.toggle': 'EN / 中文'
    }
  };

  const KEY = 'czevip.admin.locale';

  function getLocale() {
    return localStorage.getItem(KEY) || 'en';
  }
  function setLocale(loc) {
    if (!STRINGS[loc]) loc = 'en';
    localStorage.setItem(KEY, loc);
    STRINGS.current = loc;
    document.documentElement.setAttribute('lang', loc === 'zh' ? 'zh-CN' : 'en');
    applyAll();
    document.dispatchEvent(new CustomEvent('cz-locale-change', { detail: { locale: loc } }));
  }
  function t(key, vars) {
    const s = (STRINGS[STRINGS.current] && STRINGS[STRINGS.current][key]) || (STRINGS.en[key]) || key;
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  }
  function applyAll(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'))); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.setAttribute('title', t(el.getAttribute('data-i18n-title'))); });
    // Update toggle button text
    const toggle = document.querySelector('[data-lang-toggle]');
    if (toggle) toggle.textContent = STRINGS.current === 'zh' ? '中文 / EN' : 'EN / 中文';
  }

  STRINGS.current = getLocale();
  document.documentElement.setAttribute('lang', STRINGS.current === 'zh' ? 'zh-CN' : 'en');

  window.czI18n = { t, applyAll, setLocale, getLocale, STRINGS };
  // Auto-apply on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyAll());
  } else {
    applyAll();
  }
})();
