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
      'dash.security': 'Security',
      'dash.changePassword': 'Change admin password',
      'dash.passwordCurrent': 'Current password',
      'dash.passwordNext': 'New password (min 10 characters)',
      'dash.passwordConfirm': 'Confirm new password',
      'dash.passwordUpdate': 'Update password',
      'dash.passwordMismatch': 'Passwords do not match',
      'dash.passwordTooShort': 'New password must be at least 10 characters',
      'dash.passwordUpdated': 'Password updated. Use the new password on next sign-in.',
      'dash.passwordFailed': 'Failed to update password',
      'dash.passwordBadCurrent': 'Current password is incorrect',

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
      'prod.quickAdd': 'Quick add',
      'prod.quickAddTitle': 'Quick add product',
      'prod.quickAddDesc': 'Only SKU + name + price + image required. Other fields auto-filled.',
      'prod.quickAddSubmit': 'Create product',
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
      'prod.aiRefreshAll': 'AI refresh all',
      'prod.aiOne': '\u2728 AI',
      'prod.aiRefreshed': 'Refreshed {name}',
      'prod.aiRefreshAllConfirm': 'Regenerate {n} descriptions? This uses Workers AI quota.',
      'prod.aiBatchDone': 'Done: {ok}/{total} ok, {failed} failed',
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
      'lang.toggle': 'EN / ����'
    },
    zh: {
      'brand': 'CZEVIP',
      'brand.sub': '��̨����',
      'nav.dashboard': '�Ǳ��',
      'nav.inquiries': 'ѯ��',
      'nav.products': '��Ʒ',
      'nav.viewSite': '����ǰ̨',
      'nav.signOut': '�˳���¼',

      'login.title': '��¼',
      'login.password': '����',
      'login.submit': '��¼',
      'login.signingIn': '��¼��...',
      'login.failed': '��¼ʧ��',
      'login.hint': '����Ĭ������ czevip-admin�������������� Cloudflare Pages �������������� ADMIN_PASSWORD��',

      'dash.title': '�Ǳ��',
      'dash.sub': 'ѯ�����Ʒ����',
      'dash.inqTotal': 'ѯ������',
      'dash.unread': 'δ��',
      'dash.oemInq': 'OEM ѯ��',
      'dash.oemMeta': '������������',
      'dash.partnerInq': '��������',
      'dash.partnerMeta': '�����������',
      'dash.products': '��Ʒ',
      'dash.activeOf': '���� / ���¼�',
      'dash.recent': '����ѯ��',
      'dash.viewAll': '�鿴ȫ��',
      'dash.quickActions': '��ݲ���',
      'dash.quickDesc': '���ù��ܡ�',
      'dash.addProduct': '������Ʒ',
      'dash.reviewInq': '�鿴ѯ��',
      'dash.seed': '�� products.json ��ʼ�� D1',
      'dash.seedHint': '�ݵȲ��������� D1 Ϊ��ʱִ�У����ڰ����в�Ʒ���뵽��̨��',
      'dash.noInq': '����ѯ�̡�',
      'dash.failedStats': '����ͳ��ʧ��',
      'dash.seeded': '�ѵ��� {n} ����Ʒ������ {s}��',

      'inq.title': 'ѯ��',
      'inq.totalLine': '�� {n} ��',
      'inq.allKinds': 'ȫ������',
      'inq.kindContact': '��ϵ',
      'inq.kindOem': '����',
      'inq.kindPartner': '����',
      'inq.allStatus': 'ȫ��״̬',
      'inq.statusNew': '��',
      'inq.statusRead': '�Ѷ�',
      'inq.statusReplied': '�ѻظ�',
      'inq.statusArchived': '�ѹ鵵',
      'inq.colWhen': 'ʱ��',
      'inq.colKind': '����',
      'inq.colName': '����',
      'inq.colEmail': '����',
      'inq.colStatus': '״̬',
      'inq.empty': 'û��ƥ���ѯ�̡�',
      'inq.loading': '������...',
      'inq.view': '�鿴',
      'inq.updated': '�Ѹ���Ϊ {s}',
      'inq.modalTitle': 'ѯ�� #{id}',
      'inq.payload': '����',
      'inq.replyByEmail': '�ʼ��ظ�',
      'inq.close': '�ر�',
      'inq.submitted': '�ύʱ��',
      'inq.ip': 'IP',

      'prod.title': '��Ʒ',
      'prod.loading': '������...',
      'prod.addProduct': '������Ʒ',
      'prod.seed': '�� products.json ��ʼ��',
      'prod.allInclInactive': 'ȫ���������¼ܣ�',
      'prod.activeOnly': '������',
      'prod.totalAll': '{n} ����Ʒ�������¼ܣ�',
      'prod.totalActive': '{n} ����Ʒ',
      'prod.colId': 'ID',
      'prod.colName': '����',
      'prod.colCat': '����',
      'prod.colPrice': '�۸�',
      'prod.colBadge': '��ǩ',
      'prod.colFlags': '���',
      'prod.colStatus': '״̬',
      'prod.empty': '���޲�Ʒ������"������Ʒ"��"�� products.json ��ʼ��"��',
      'prod.featured': '��ѡ',
      'prod.new': '��Ʒ',
      'prod.active': '����',
      'prod.inactive': '���¼�',
      'prod.edit': '�༭',
      'prod.archive': '�¼�',
      'prod.duplicate': '����',      'prod.aiRefreshAll': 'AI \u5168\u90e8\u5237\u65b0',      'prod.aiOne': '\u2728 AI',      'prod.aiRefreshed': '\u5df2\u5237\u65b0 {name}',      'prod.aiRefreshAllConfirm': '\u5c06\u91cd\u65b0\u751f\u6210 {n} \u4e2a\u5546\u54c1\u63cf\u8ff0\uff1f\u4f1a\u6d88\u8017 Workers AI \u914d\u989d\u3002',      'prod.aiBatchDone': '\u5b8c\u6210\uff1a{ok}/{total} \u6210\u529f\uff0c{failed} \u5931\u8d25',
      'prod.archiveConfirm': 'ȷ���¼� {id}����Ʒ���ǰ̨���أ��������� D1 �С�',
      'prod.archived': '���¼�',
      'prod.archiveFailed': '�¼�ʧ��',
      'prod.loadFailed': '����ʧ��',
      'prod.saved': '�ѱ���',
      'prod.created': '�Ѵ���',
      'prod.saveFailed': '����ʧ��',

      'edit.newProduct': '������Ʒ',
      'edit.editProduct': '�༭ {name}',
      'edit.field.id': 'ID',
      'edit.field.slug': 'Slug',
      'edit.field.name': '����',
      'edit.field.color': '��ɫ',
      'edit.field.cat': '����',
      'edit.field.price': '�۸���Ԫ��',
      'edit.field.compareAt': '�Աȼ�',
      'edit.field.material': '����',
      'edit.field.origin': '����',
      'edit.field.weight': '����������',
      'edit.field.badge': '��ǩ',
      'edit.field.mpn': 'MPN',
      'edit.field.sizes': '���루���ŷָ��',
      'edit.field.colors': '��ɫ�����ŷָ��',
      'edit.field.primaryImage': '��ͼ',
      'edit.field.images': '����ͼƬ�����ŷָ��',
      'edit.field.desc': '����',
      'edit.field.availability': '���״̬',
      'edit.field.condition': '��ɫ',
      'edit.field.gtin': 'GTIN',
      'edit.field.featured': '��ѡ',
      'edit.field.new': '���Ϊ��Ʒ',
      'edit.field.active': '���ۣ�ǰ̨�ɼ���',
      'edit.cancel': 'ȡ��',
      'edit.create': '������Ʒ',
      'edit.save': '�����޸�',
      'edit.upload': '�ϴ�ͼƬ',
      'edit.uploading': '�ϴ���...',

      'bulk.selected': '��ѡ {n} ��',
      'bulk.clear': '���',
      'bulk.action': '��������',
      'bulk.setPrice': '���ü۸�',
      'bulk.adjustPrice': '���ٷֱȵ���',
      'bulk.setBadge': '���ñ�ǩ',
      'bulk.clearBadge': '��ձ�ǩ',
      'bulk.setAvail': '���ÿ��',
      'bulk.archive': '�����¼�',
      'bulk.apply': 'Ӧ��',
      'bulk.applied': '�Ѹ��� {n} ����Ʒ',
      'bulk.failed': '��������ʧ��',
      'bulk.pickAction': '��ѡ�����',

      'common.confirm': 'ȷ��',
      'common.cancel': 'ȡ��',
      'common.close': '�ر�',
      'common.yes': '��',
      'common.no': '��',

      'lang.toggle': 'EN / ����'
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
    if (toggle) toggle.textContent = STRINGS.current === 'zh' ? '���� / EN' : 'EN / ����';
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
