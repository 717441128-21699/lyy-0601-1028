export default defineAppConfig({
  pages: [
    'pages/waybill/index',
    'pages/subscription/index',
    'pages/tracking/index',
    'pages/feedback/index',
    'pages/expense/index',
    'pages/waybill-detail/index',
    'pages/subscription-detail/index',
    'pages/customer-service/index',
    'pages/e-receipt/index',
    'pages/feedback-detail/index',
    'pages/notification/index',
    'pages/bill-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0077C8',
    navigationBarTitleText: '水运货主查询',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F0F7FF'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#0077C8',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/waybill/index',
        text: '运单查询'
      },
      {
        pagePath: 'pages/subscription/index',
        text: '船期订阅'
      },
      {
        pagePath: 'pages/tracking/index',
        text: '节点轨迹'
      },
      {
        pagePath: 'pages/feedback/index',
        text: '异常反馈'
      },
      {
        pagePath: 'pages/expense/index',
        text: '费用明细'
      }
    ]
  }
})
