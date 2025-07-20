/**
 * 国際化ユーティリティ
 */

type Language = 'ja' | 'en';
type Currency = 'JPY' | 'USD';

// サーバーサイド専用の設定取得（APIルートでのみ使用）
export const getServerLanguage = (): Language => {
  const lang = process.env.LANGUAGE || 'en';
  return lang.toLowerCase() === 'ja' ? 'ja' : 'en';
};

export const getServerCurrency = (): Currency => {
  const currency = process.env.CURRENCY || 'usd';
  return currency.toLowerCase() === 'jpy' ? 'JPY' : 'USD';
};

// 非推奨：直接使用せず、useClientI18nフックを使用してください
export const getLanguage = (): Language => {
  throw new Error(
    'getLanguage() should not be used directly. Use useClientI18n() hook instead.',
  );
};

export const getCurrency = (): Currency => {
  throw new Error(
    'getCurrency() should not be used directly. Use useClientI18n() hook instead.',
  );
};

// テキスト翻訳
export const translations = {
  // Dashboard
  dashboard: {
    ja: 'ダッシュボード',
    en: 'Dashboard',
  },
  welcome: {
    ja: 'おかえりなさい！今日のビジネス状況をご確認ください。',
    en: "Welcome back! Here's what's happening with your business today.",
  },

  // Navigation
  orders: {
    ja: '注文管理',
    en: 'Orders',
  },
  onetimeOrders: {
    ja: '一回払い注文',
    en: 'Onetime Orders',
  },
  subscriptions: {
    ja: 'サブスク管理',
    en: 'Subscriptions',
  },
  settings: {
    ja: '設定',
    en: 'Settings',
  },

  // Metrics
  totalRevenue: {
    ja: '総売上',
    en: 'Total Revenue',
  },
  totalCustomers: {
    ja: '顧客数',
    en: 'Total Customers',
  },
  totalOrders: {
    ja: '注文数',
    en: 'Total Orders',
  },
  unpaidOrders: {
    ja: '未払い注文',
    en: 'Unpaid Orders',
  },
  unpaidRate: {
    ja: '未払い率',
    en: 'Unpaid Rate',
  },
  currentMonthRevenue: {
    ja: '当月売上予定',
    en: 'Current Month Revenue',
  },
  subscriptionRevenue: {
    ja: 'サブスク売上',
    en: 'Subscription Revenue',
  },
  onetimeOrderCount: {
    ja: '一回払い注文数',
    en: 'Onetime Orders',
  },
  subscriptionOrderCount: {
    ja: 'サブスク注文数',
    en: 'Subscription Orders',
  },
  onetimeAvgOrderValue: {
    ja: '一回払い平均単価',
    en: 'Onetime Avg Value',
  },
  subscriptionAvgValue: {
    ja: 'サブスク平均単価',
    en: 'Subscription Avg Value',
  },
  onetime: {
    ja: '一回払い',
    en: 'Onetime',
  },
  subscription: {
    ja: 'サブスク',
    en: 'Subscription',
  },

  // Customer Management
  customers: {
    ja: '顧客管理',
    en: 'Customers',
  },
  customerManagement: {
    ja: '顧客情報の管理と分析を行います',
    en: 'Manage and analyze customer information',
  },
  addCustomer: {
    ja: '顧客追加',
    en: 'Add Customer',
  },
  customerName: {
    ja: '顧客名',
    en: 'Customer Name',
  },
  orderCount: {
    ja: '注文数',
    en: 'Orders',
  },
  revenue: {
    ja: '売上',
    en: 'Revenue',
  },
  lastOrder: {
    ja: '最終注文',
    en: 'Last Order',
  },
  actions: {
    ja: 'アクション',
    en: 'Actions',
  },
  allCustomers: {
    ja: '全顧客',
    en: 'All Customers',
  },
  totalCustomersCount: {
    ja: '総顧客数',
    en: 'Total Customers',
  },
  topCustomers: {
    ja: 'トップ顧客',
    en: 'Top Customers',
  },
  created: {
    ja: '作成日',
    en: 'Created',
  },

  // Orders Management
  orderManagementTitle: {
    ja: '注文管理',
    en: 'Order Management',
  },
  orderManagement: {
    ja: '注文情報の管理と売上分析を行います',
    en: 'Manage orders and analyze sales data',
  },
  addOrder: {
    ja: '注文追加',
    en: 'Add Order',
  },
  orderId: {
    ja: '注文ID',
    en: 'Order ID',
  },
  amount: {
    ja: '金額',
    en: 'Amount',
  },
  serviceType: {
    ja: 'サービス種別',
    en: 'Service Type',
  },
  paymentType: {
    ja: '支払い形態',
    en: 'Payment Type',
  },
  salesStartDate: {
    ja: '売上開始日',
    en: 'Sales Start Date',
  },
  salesEndDate: {
    ja: '売上終了日',
    en: 'Sales End Date',
  },
  salesDate: {
    ja: '販売日',
    en: 'Sales Date',
  },
  isPaid: {
    ja: '支払い状況',
    en: 'Payment Status',
  },
  paid: {
    ja: '支払済',
    en: 'Paid',
  },
  unpaid: {
    ja: '未払',
    en: 'Unpaid',
  },

  // Subscription specific
  subscriptionDetail: {
    ja: 'サブスクリプション詳細',
    en: 'Subscription Detail',
  },
  basicInformation: {
    ja: '基本情報',
    en: 'Basic Information',
  },
  currentMonthlyFee: {
    ja: '現在の月額料金',
    en: 'Current Monthly Fee',
  },
  status: {
    ja: 'ステータス',
    en: 'Status',
  },
  active: {
    ja: 'アクティブ',
    en: 'Active',
  },
  inactive: {
    ja: '非アクティブ',
    en: 'Inactive',
  },
  priceHistory: {
    ja: '料金履歴',
    en: 'Price History',
  },
  paymentHistory: {
    ja: '支払い履歴',
    en: 'Payment History',
  },
  endDate: {
    ja: '終了日',
    en: 'End Date',
  },
  ended: {
    ja: '終了',
    en: 'Ended',
  },
  ongoing: {
    ja: '継続中',
    en: 'Ongoing',
  },
  yearMonth: {
    ja: '年月',
    en: 'Year/Month',
  },
  paymentStatus: {
    ja: '支払い状況',
    en: 'Payment Status',
  },
  paidStatus: {
    ja: '支払い済み',
    en: 'Paid',
  },
  unpaidStatus: {
    ja: '未払い',
    en: 'Unpaid',
  },
  action: {
    ja: '操作',
    en: 'Action',
  },
  markAsUnpaid: {
    ja: '未払いにする',
    en: 'Mark as Unpaid',
  },
  markAsPaid: {
    ja: '支払い済みにする',
    en: 'Mark as Paid',
  },
  changeFee: {
    ja: '料金変更',
    en: 'Change Fee',
  },
  cancelSubscription: {
    ja: 'キャンセル',
    en: 'Cancel',
  },
  restartSubscription: {
    ja: '再開',
    en: 'Restart',
  },
  feeChangeModal: {
    ja: '料金変更',
    en: 'Fee Change',
  },
  newMonthlyFee: {
    ja: '新しい月額料金',
    en: 'New Monthly Fee',
  },
  effectiveDate: {
    ja: '適用開始日',
    en: 'Effective Date',
  },
  change: {
    ja: '変更',
    en: 'Change',
  },
  cancelModal: {
    ja: 'サブスクリプションキャンセル',
    en: 'Cancel Subscription',
  },
  cancelWarning: {
    ja: 'この操作は取り消すことができません。キャンセル日以降は課金が停止されます。',
    en: 'This action cannot be undone. Billing will stop after the cancellation date.',
  },
  cancelDate: {
    ja: 'キャンセル日',
    en: 'Cancellation Date',
  },
  confirmCancel: {
    ja: 'キャンセル実行',
    en: 'Confirm Cancel',
  },
  restartModal: {
    ja: 'サブスクリプション再開',
    en: 'Restart Subscription',
  },
  restartWarning: {
    ja: 'サブスクリプションを再開します。再開日以降から課金が開始されます。',
    en: 'This will restart the subscription. Billing will resume from the restart date.',
  },
  restartDate: {
    ja: '再開日',
    en: 'Restart Date',
  },
  confirmRestart: {
    ja: '再開実行',
    en: 'Confirm Restart',
  },
  markPaid: {
    ja: '支払い済みにする',
    en: 'Mark as Paid',
  },
  markUnpaid: {
    ja: '未払いにする',
    en: 'Mark as Unpaid',
  },
  lastMonthlyFee: {
    ja: '最後の月額料金',
    en: 'Last Monthly Fee',
  },
  noFeeHistory: {
    ja: '料金履歴がありません',
    en: 'No fee history available',
  },
  noPaymentHistory: {
    ja: '支払い履歴がありません',
    en: 'No payment history available',
  },

  // Customer Detail
  onetimeRevenue: {
    ja: 'One-time収益',
    en: 'One-time Revenue',
  },
  ordersCount: {
    ja: 'Orders',
    en: 'Orders',
  },
  noOnetimeOrders: {
    ja: 'One-time注文がありません',
    en: 'No one-time orders available',
  },
  noSubscriptions: {
    ja: 'サブスクリプションがありません',
    en: 'No subscriptions available',
  },
  orderIdLabel: {
    ja: '注文ID',
    en: 'Order ID',
  },
  subscriptionIdLabel: {
    ja: 'サブスクID',
    en: 'Subscription ID',
  },
  subscriptionId: {
    ja: 'サブスクリプションID',
    en: 'Subscription ID',
  },

  startDate: {
    ja: '開始日',
    en: 'Start Date',
  },

  // Common
  search: {
    ja: '検索',
    en: 'Search',
  },
  edit: {
    ja: '編集',
    en: 'Edit',
  },
  delete: {
    ja: '削除',
    en: 'Delete',
  },
  save: {
    ja: '保存',
    en: 'Save',
  },
  cancel: {
    ja: 'キャンセル',
    en: 'Cancel',
  },
  loading: {
    ja: '読み込み中...',
    en: 'Loading...',
  },
  noData: {
    ja: 'データがありません',
    en: 'No data available',
  },

  // Chart labels
  monthlySales: {
    ja: '月別売上推移',
    en: 'Monthly Sales Trend',
  },
  monthlySalesDescription: {
    ja: '合計・プロジェクト・Squadbase別の売上変化',
    en: 'Sales changes by Total, Project, and Squadbase',
  },
  total: {
    ja: '合計',
    en: 'Total',
  },
  project: {
    ja: 'プロジェクト',
    en: 'Project',
  },
  product: {
    ja: 'Product',
    en: 'Product',
  },
  projectType: {
    ja: 'プロジェクト型サービス',
    en: 'Project Type Service',
  },

  // Time periods
  thisMonth: {
    ja: '今月',
    en: 'This Month',
  },
  lastMonth: {
    ja: '先月',
    en: 'Last Month',
  },
  vsLastMonth: {
    ja: 'vs 前月',
    en: 'vs Last Month',
  },

  // Units
  people: {
    ja: '人',
    en: ' people',
  },
  orders_unit: {
    ja: '件',
    en: ' orders',
  },
  percent: {
    ja: '%',
    en: '%',
  },

  // Period Selector
  period: {
    ja: '期間',
    en: 'Period',
  },
  halfYear: {
    ja: '半年',
    en: '6 Months',
  },
  oneYear: {
    ja: '一年',
    en: '1 Year',
  },
  allPeriod: {
    ja: '全期間',
    en: 'All Time',
  },

  // Data status
  noDataText: {
    ja: 'データなし',
    en: 'No Data',
  },
  countVsLastMonth: {
    ja: '件 vs 前月',
    en: ' vs Last Month',
  },
  rateVsLastMonth: {
    ja: '率 vs 前月',
    en: 'Rate vs Last Month',
  },

  // Recent Orders
  recentOrders: {
    ja: '最近の注文',
    en: 'Recent Orders',
  },
  viewAll: {
    ja: '全て表示',
    en: 'View All',
  },
  oneTime: {
    ja: '一回払い',
    en: 'One-time',
  },
  productService: {
    ja: 'プロダクトサービス',
    en: 'Product Service',
  },
  projectService: {
    ja: 'プロジェクト',
    en: 'Project',
  },
  selectTemplate: {
    ja: 'テンプレートから選択',
    en: 'Select from template',
  },
  noTemplate: {
    ja: 'テンプレートを使用しない',
    en: 'Do not use template',
  },

  // Orders page
  newOrder: {
    ja: '新規注文',
    en: 'New Order',
  },
  orderDescription: {
    ja: '売上データの管理と各注文のステータス追跡を行うページ。支払い状況や売上実績の把握が可能。',
    en: 'Manage sales data and track order status. Monitor payment status and sales performance.',
  },

  // Pagination
  previous: {
    ja: '前へ',
    en: 'Previous',
  },
  next: {
    ja: '次へ',
    en: 'Next',
  },

  // Settings page
  currentSettings: {
    ja: '現在の設定',
    en: 'Current Settings',
  },
  language: {
    ja: '言語',
    en: 'Language',
  },
  currency: {
    ja: '通貨',
    en: 'Currency',
  },
  japanese: {
    ja: '日本語',
    en: 'Japanese',
  },
  english: {
    ja: '英語',
    en: 'English',
  },
  yen: {
    ja: '円',
    en: 'Yen (JPY)',
  },
  dollar: {
    ja: 'ドル',
    en: 'Dollar (USD)',
  },

  // Period selection for Orders
  aggregationPeriod: {
    ja: '集計期間',
    en: 'Aggregation Period',
  },
  reset: {
    ja: 'リセット',
    en: 'Reset',
  },
  currentMonth: {
    ja: '今月',
    en: 'This Month',
  },
  previousMonth: {
    ja: '前月',
    en: 'Last Month',
  },
  contractStartDate: {
    ja: '契約開始日（以上）',
    en: 'Contract Start Date (From)',
  },
  contractEndDate: {
    ja: '契約終了日（以前）',
    en: 'Contract End Date (To)',
  },
  salesDateStart: {
    ja: '販売日（以上）',
    en: 'Sales Date (From)',
  },
  salesDateEnd: {
    ja: '販売日（以前）',
    en: 'Sales Date (To)',
  },

  // Settings page detailed
  settingsDescription: {
    ja: 'システムの設定を確認・管理します',
    en: 'View and manage system settings',
  },
  languageSettings: {
    ja: '言語設定',
    en: 'Language Settings',
  },
  systemDisplayLanguage: {
    ja: 'システムの表示言語',
    en: 'System display language',
  },
  currencySettings: {
    ja: '通貨設定',
    en: 'Currency Settings',
  },
  currencyDisplayUnit: {
    ja: '金額表示の通貨単位',
    en: 'Currency unit for amount display',
  },
  environmentVariable: {
    ja: '環境変数',
    en: 'Environment Variable',
  },
  settingsChangeInfo: {
    ja: '設定変更について',
    en: 'About Settings Changes',
  },
  settingsChangeDescription: {
    ja: '言語と通貨の設定を変更するには、.envファイルで以下の環境変数を編集してください：',
    en: 'To change language and currency settings, edit the following environment variables in the .env file:',
  },
  restartRequired: {
    ja: '※ 設定変更後はアプリケーションの再起動が必要です',
    en: '* Application restart is required after changing settings',
  },

  // Filter and search
  filterSearch: {
    ja: 'フィルター・検索',
    en: 'Filter & Search',
  },
  clear: {
    ja: 'クリア',
    en: 'Clear',
  },
  all: {
    ja: 'すべて',
    en: 'All',
  },
  searchCustomerDescription: {
    ja: '検索（顧客名・説明文）',
    en: 'Search (Customer Name & Description)',
  },
  searchPlaceholder: {
    ja: '検索キーワードを入力...',
    en: 'Enter search keywords...',
  },

  // Table headers and UI
  customerNameHeader: {
    ja: '顧客名',
    en: 'Customer Name',
  },
  service: {
    ja: 'サービス',
    en: 'Service',
  },
  paymentTypeHeader: {
    ja: '支払い形態',
    en: 'Payment Type',
  },
  periodHeader: {
    ja: '期間',
    en: 'Period',
  },
  amountHeader: {
    ja: '金額',
    en: 'Amount',
  },
  serviceTypeHeader: {
    ja: 'サービス種別',
    en: 'Service Type',
  },

  // Sales summary
  totalOrdersCount: {
    ja: '総注文数',
    en: 'Total Orders',
  },
  totalSales: {
    ja: '総売上',
    en: 'Total Sales',
  },
  paidAmount: {
    ja: '支払済',
    en: 'Paid',
  },
  unpaidAmount: {
    ja: '未払',
    en: 'Unpaid',
  },

  // Customer detail page
  customerNotFound: {
    ja: '顧客が見つかりません',
    en: 'Customer not found',
  },
  dataFetchFailed: {
    ja: 'データの取得に失敗しました',
    en: 'Failed to fetch data',
  },
  customerDetail: {
    ja: '顧客詳細',
    en: 'Customer Detail',
  },
  customerDetailDescription: {
    ja: '顧客の詳細情報と注文履歴',
    en: 'Customer details and order history',
  },
  orderHistory: {
    ja: '注文履歴',
    en: 'Order History',
  },
  noOrderHistory: {
    ja: '注文履歴がありません',
    en: 'No order history',
  },
  payment: {
    ja: '支払い',
    en: 'Payment',
  },
  paidCount: {
    ja: '支払済み',
    en: 'Paid',
  },
  unpaidCount: {
    ja: '未払い',
    en: 'Unpaid',
  },
  ordersUnit: {
    ja: '件',
    en: ' orders',
  },
  back: {
    ja: '戻る',
    en: 'Back',
  },
  registrationDate: {
    ja: '登録日',
    en: 'Registration Date',
  },
  updateDate: {
    ja: '更新日',
    en: 'Update Date',
  },

  // Order Form Modal
  newOrderModal: {
    ja: '新規注文',
    en: 'New Order',
  },
  editOrder: {
    ja: '注文編集',
    en: 'Edit Order',
  },
  customer: {
    ja: '顧客',
    en: 'Customer',
  },
  selectCustomer: {
    ja: '顧客を選択してください',
    en: 'Please select a customer',
  },
  contractStartDateModal: {
    ja: '契約開始日',
    en: 'Contract Start Date',
  },
  contractEndDateModal: {
    ja: '契約終了日',
    en: 'Contract End Date',
  },
  currencyModal: {
    ja: '通貨',
    en: 'Currency',
  },
  isPaidLabel: {
    ja: '支払い済み',
    en: 'Payment Received',
  },
  description: {
    ja: '説明',
    en: 'Description',
  },
  descriptionPlaceholder: {
    ja: '注文に関する詳細情報があれば入力してください',
    en: 'Enter detailed information about the order if any',
  },
  datePlaceholder: {
    ja: 'yyyy-mm-dd',
    en: 'yyyy-mm-dd',
  },
  startDatePlaceholder: {
    ja: '開始日を選択',
    en: 'Select start date',
  },
  endDatePlaceholder: {
    ja: '終了日を選択',
    en: 'Select end date',
  },
  dateFormatPlaceholder: {
    ja: '年/月/日',
    en: 'yyyy/mm/dd',
  },
  create: {
    ja: '作成',
    en: 'Create',
  },
  update: {
    ja: '更新',
    en: 'Update',
  },
  saving: {
    ja: '保存中...',
    en: 'Saving...',
  },
  requiredFieldsError: {
    ja: '必須項目を入力してください',
    en: 'Please fill in all required fields',
  },
  amountValidationError: {
    ja: '金額は正の数値を入力してください',
    en: 'Please enter a positive number for the amount',
  },
  saveFailedError: {
    ja: '保存に失敗しました',
    en: 'Failed to save',
  },

  // Delete Confirmation Dialog
  deleteOrder: {
    ja: '注文の削除',
    en: 'Delete Order',
  },
  deleteConfirmMessage: {
    ja: '以下の注文を削除しようとしています：',
    en: 'You are about to delete the following order:',
  },
  deleteWarning: {
    ja: 'この操作は取り消すことができません。注文に関連するデータも完全に削除されます。',
    en: 'This action cannot be undone. All data related to this order will be permanently deleted.',
  },
  warning: {
    ja: '警告',
    en: 'Warning',
  },
  deleteAction: {
    ja: '削除する',
    en: 'Delete',
  },
  deleting: {
    ja: '削除中...',
    en: 'Deleting...',
  },

  // Order Detail Page
  orderDetails: {
    ja: '注文詳細',
    en: 'Order Details',
  },
  orderDetailDescription: {
    ja: '注文の詳細情報と関連データを確認できます',
    en: 'View detailed order information and related data',
  },
  orderNotFound: {
    ja: '注文が見つかりません',
    en: 'Order not found',
  },
  serviceDetails: {
    ja: 'サービス詳細',
    en: 'Service Details',
  },
  history: {
    ja: '履歴',
    en: 'History',
  },
  lastUpdated: {
    ja: '最終更新',
    en: 'Last Updated',
  },
  details: {
    ja: '詳細',
    en: 'Details',
  },

  // Order Templates
  orderTemplates: {
    ja: '注文テンプレート',
    en: 'Order Templates',
  },
  orderTemplateManagement: {
    ja: '注文テンプレートの管理と効率的な注文作成を行います',
    en: 'Manage order templates for efficient order creation',
  },
  addTemplate: {
    ja: 'テンプレート追加',
    en: 'Add Template',
  },
  templateName: {
    ja: 'テンプレート名',
    en: 'Template Name',
  },
  templateNamePlaceholder: {
    ja: 'テンプレート名を入力',
    en: 'Enter template name',
  },
  serviceTypeTemplate: {
    ja: 'サービス種別',
    en: 'Service Type',
  },
  paymentTypeTemplate: {
    ja: '支払い形態',
    en: 'Payment Type',
  },
  amountTemplate: {
    ja: '金額',
    en: 'Amount',
  },
  amountPlaceholder: {
    ja: '金額を入力',
    en: 'Enter amount',
  },
  descriptionTemplate: {
    ja: '説明',
    en: 'Description',
  },
  templateDescriptionPlaceholder: {
    ja: 'テンプレートの説明（オプション）',
    en: 'Template description (optional)',
  },
  statusTemplate: {
    ja: 'ステータス',
    en: 'Status',
  },
  lastUpdatedTemplate: {
    ja: '最終更新',
    en: 'Last Updated',
  },
  actionsTemplate: {
    ja: 'アクション',
    en: 'Actions',
  },
  productTemplate: {
    ja: 'プロダクト',
    en: 'Product',
  },
  projectTemplate: {
    ja: 'プロジェクト',
    en: 'Project',
  },
  subscriptionTemplate: {
    ja: 'サブスクリプション',
    en: 'Subscription',
  },
  onetimeTemplate: {
    ja: '一回払い',
    en: 'One-time',
  },
  viewTemplate: {
    ja: '詳細表示',
    en: 'View Details',
  },
  useTemplate: {
    ja: 'テンプレートを使用',
    en: 'Use Template',
  },
  editTemplate: {
    ja: '編集',
    en: 'Edit',
  },
  deleteTemplate: {
    ja: '削除',
    en: 'Delete',
  },
  activateTemplate: {
    ja: 'アクティブにする',
    en: 'Activate',
  },
  deactivateTemplate: {
    ja: '非アクティブにする',
    en: 'Deactivate',
  },
  createTemplate: {
    ja: 'テンプレート作成',
    en: 'Create Template',
  },
  editTemplateTitle: {
    ja: 'テンプレート編集',
    en: 'Edit Template',
  },
  templateDetails: {
    ja: 'テンプレート詳細',
    en: 'Template Details',
  },
  deleteTemplateTitle: {
    ja: 'テンプレート削除',
    en: 'Delete Template',
  },
  deleteTemplateConfirm: {
    ja: '以下のテンプレートを完全に削除しますか？',
    en: 'Are you sure you want to permanently delete the following template?',
  },
  deleteTemplateWarning: {
    ja: '削除されたテンプレートは復元できません。関連する注文履歴への影響はありませんが、今後このテンプレートを使用することはできなくなります。',
    en: 'Deleted templates cannot be restored. This will not affect related order history, but you will no longer be able to use this template.',
  },
  deleteTemplateAction: {
    ja: '削除する',
    en: 'Delete',
  },
  createOrderFromTemplate: {
    ja: 'テンプレートから注文を作成',
    en: 'Create Order from Template',
  },
  createOrderFromTemplateDescription: {
    ja: 'このテンプレートの設定値を使用して新しい注文を作成します。注文作成ページで顧客選択と必要に応じた調整を行えます。',
    en: "Create a new order using this template's settings. You can select a customer and make adjustments on the order creation page.",
  },
  nextSteps: {
    ja: '次のステップ',
    en: 'Next Steps',
  },
  createOrderPageRedirect: {
    ja: '注文作成ページへ',
    en: 'Go to Order Creation',
  },
  templateNotFound: {
    ja: 'テンプレートが見つかりませんでした',
    en: 'Template not found',
  },
  noTemplatesFound: {
    ja: 'テンプレートが見つかりませんでした',
    en: 'No templates found',
  },
  noTemplatesFoundDescription: {
    ja: '新しいテンプレートを作成するか、フィルターを調整してください',
    en: 'Create a new template or adjust your filters',
  },
  loadingTemplates: {
    ja: '読み込み中...',
    en: 'Loading...',
  },
  templateSaved: {
    ja: 'テンプレートが保存されました',
    en: 'Template saved successfully',
  },
  templateSaveError: {
    ja: 'テンプレートの保存に失敗しました',
    en: 'Failed to save template',
  },
  templateDeleted: {
    ja: 'テンプレートが削除されました',
    en: 'Template deleted successfully',
  },
  templateDeleteError: {
    ja: 'テンプレートの削除に失敗しました',
    en: 'Failed to delete template',
  },
  requiredFieldError: {
    ja: '必須項目を入力してください',
    en: 'Please fill in all required fields',
  },
  amountValidationErrorTemplate: {
    ja: '金額は正の数値を入力してください',
    en: 'Please enter a positive number for the amount',
  },
  // Navigation Sections
  salesManagementSection: {
    ja: '売上管理',
    en: 'Sales Management',
  },
  settingsSection: {
    ja: '設定',
    en: 'Settings',
  },
  // Page Titles
  dashboardTitle: {
    ja: 'ダッシュボード - Squadbase CRM',
    en: 'Dashboard - Squadbase CRM',
  },
  ordersTitle: {
    ja: '注文管理 - Squadbase CRM',
    en: 'Orders - Squadbase CRM',
  },
  customersTitle: {
    ja: '顧客管理 - Squadbase CRM',
    en: 'Customer Management - Squadbase CRM',
  },
  orderTemplatesTitle: {
    ja: 'テンプレート管理 - Squadbase CRM',
    en: 'Order Templates - Squadbase CRM',
  },
  settingsTitle: {
    ja: '設定 - Squadbase CRM',
    en: 'Settings - Squadbase CRM',
  },
  defaultTitle: {
    ja: 'Squadbase CRM',
    en: 'Squadbase CRM',
  },
  // Empty State Messages  
  noOrdersFound: {
    ja: '注文データがありません',
    en: 'No orders found',
  },
  noOrdersFoundDescription: {
    ja: '新しい注文を作成して売上管理を始めましょう',
    en: 'Create your first order to start managing sales',
  },
  createFirstOrder: {
    ja: '最初の注文を作成',
    en: 'Create First Order',
  },
  loadingOrders: {
    ja: '注文を読み込み中...',
    en: 'Loading orders...',
  },

  // Subscription Detail Page
  subscriptionDetailDescription: {
    ja: 'サブスクリプションの詳細情報と支払い履歴',
    en: 'Subscription details and payment history',
  },
  subscriptionNotFound: {
    ja: 'サブスクリプションが見つかりません',
    en: 'Subscription not found',
  },
  errorOccurred: {
    ja: 'エラーが発生しました',
    en: 'An error occurred',
  },
  loadingSubscription: {
    ja: '読み込み中...',
    en: 'Loading...',
  },
  subscriptionStatus: {
    ja: 'ステータス',
    en: 'Status',
  },
  serviceContent: {
    ja: 'サービス内容',
    en: 'Service Content',
  },
  creationDate: {
    ja: '作成日',
    en: 'Creation Date',
  },
  lastUpdate: {
    ja: '最終更新',
    en: 'Last Update',
  },
  targetMonth: {
    ja: '対象月',
    en: 'Target Month',
  },
  paymentStatusHistory: {
    ja: '支払い状況',
    en: 'Payment Status',
  },
  newSubscription: {
    ja: '新規サブスク',
    en: 'New Subscription',
  },
  subscriptionsDescription: {
    ja: 'サブスクリプション型サービスの管理と支払い状況の追跡を行います',
    en: 'Manage subscription services and track payment status',
  },
  totalSubscriptions: {
    ja: '総サブスク数',
    en: 'Total Subscriptions',
  },
  activeSubscriptions: {
    ja: 'アクティブ',
    en: 'Active',
  },
  monthlyRevenueExpected: {
    ja: '月間売上予定',
    en: 'Monthly Revenue Expected',
  },
  thisMonthPaid: {
    ja: '今月支払済',
    en: 'This Month Paid',
  },
  thisMonthUnpaid: {
    ja: '今月未払',
    en: 'This Month Unpaid',
  },
  monthlyFee: {
    ja: '月額料金',
    en: 'Monthly Fee',
  },
  totalPaid: {
    ja: '支払済合計',
    en: 'Total Paid',
  },
  totalUnpaid: {
    ja: '未払合計',
    en: 'Total Unpaid',
  },
  subscriptionsTitle: {
    ja: 'サブスクリプション - Squadbase CRM',
    en: 'Subscriptions - Squadbase CRM',
  },
  // Subscription-specific translations
  newSubscriptionButton: {
    ja: '新規サブスク',
    en: 'New Subscription',
  },
  loadingSubscriptions: {
    ja: 'サブスクリプションを読み込み中...',
    en: 'Loading subscriptions...',
  },
  noSubscriptionsFound: {
    ja: 'サブスクリプションデータがありません',
    en: 'No subscription data found',
  },
  noSubscriptionsDescription: {
    ja: '新しいサブスクリプションを作成して管理を始めましょう',
    en: 'Create a new subscription to start managing services',
  },
  createFirstSubscription: {
    ja: '最初のサブスクを作成',
    en: 'Create First Subscription',
  },
  paymentStartDate: {
    ja: '支払い開始日',
    en: 'Payment Start Date',
  },
  paymentEndDate: {
    ja: '支払い終了日',
    en: 'Payment End Date',
  },
  continuing: {
    ja: '継続中',
    en: 'Continuing',
  },
  viewDetails: {
    ja: '詳細',
    en: 'Details',
  },
  filterSearchSubscriptions: {
    ja: 'フィルター・検索',
    en: 'Filter & Search',
  },
  searchCustomerService: {
    ja: '検索（顧客名・説明文）',
    en: 'Search (Customer Name & Description)',
  },
  searchKeywordsPlaceholder: {
    ja: '検索キーワードを入力...',
    en: 'Enter search keywords...',
  },
  planTemplate: {
    ja: 'プランテンプレート',
    en: 'Plan Template',
  },
  selectTemplateOptional: {
    ja: 'テンプレートを選択（任意）',
    en: 'Select template (optional)',
  },
  monthlyFeeRequired: {
    ja: '月額料金',
    en: 'Monthly Fee',
  },
  startDateRequired: {
    ja: '開始日',
    en: 'Start Date',
  },
  subscriptionDescriptionPlaceholder: {
    ja: 'サブスクリプションの説明（例：プロダクト月額プラン - スタンダード）',
    en: 'Subscription description (e.g., Monthly Product Plan - Standard)',
  },
  creating: {
    ja: '作成中...',
    en: 'Creating...',
  },
  
  // Additional subscription detail translations
  loadingSubscriptionDetails: {
    ja: 'サブスクリプション詳細を読み込み中...',
    en: 'Loading subscription details...',
  },
  errorLoadingSubscription: {
    ja: 'サブスクリプションの読み込み中にエラーが発生しました',
    en: 'Error occurred while loading subscription',
  },
};

export type TranslationKey = keyof typeof translations;

/**
 * 翻訳テキストを取得
 */
export const t = (key: TranslationKey): string => {
  const language = getLanguage();
  return translations[key][language] || translations[key]['en'] || key;
};

/**
 * 通貨フォーマット
 */
export const formatCurrency = (amount: number): string => {
  const currency = getCurrency();
  const language = getLanguage();

  const locale = language === 'ja' ? 'ja-JP' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);
};

/**
 * 数値フォーマット（カンマ区切り）
 */
export const formatNumber = (value: number): string => {
  const language = getLanguage();
  const locale = language === 'ja' ? 'ja-JP' : 'en-US';

  return new Intl.NumberFormat(locale).format(value);
};

/**
 * 日付フォーマット
 */
export const formatDate = (date: string | Date): string => {
  const language = getLanguage();
  const locale = language === 'ja' ? 'ja-JP' : 'en-US';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
