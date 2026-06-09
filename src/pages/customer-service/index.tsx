import React from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const faqList = [
  {
    question: '如何查询运单进度？',
    answer: '您可以在"运单查询"页面输入运单号或扫描二维码，即可查看运单的实时运输进度和节点信息。'
  },
  {
    question: '船期订阅提醒如何开启？',
    answer: '在"船期订阅"页面选择您关注的航线和船名，勾选需要的提醒类型（开航、靠泊、延误等），点击订阅即可。'
  },
  {
    question: '发现货物异常怎么办？',
    answer: '请在"异常反馈"页面选择问题类型，填写详细描述并上传相关照片，我们会在24小时内处理并回复。'
  },
  {
    question: '费用支付支持哪些方式？',
    answer: '目前支持微信支付、支付宝、银行转账等多种支付方式。如有特殊需求，请联系客服人员。'
  },
  {
    question: '电子回单如何下载？',
    answer: '在运单详情页点击"电子回单"按钮即可下载PDF格式的电子回单，如需纸质发票请联系客服。'
  }
];

const CustomerServicePage: React.FC = () => {
  const handleCall = () => {
    Taro.makePhoneCall({
      phoneNumber: '400-888-8888',
      fail: (err) => {
        console.error('[CustomerService] 拨打电话失败:', err);
      }
    });
  };

  const handleCopyWechat = () => {
    Taro.setClipboardData({
      data: 'water_transport_cs',
      success: () => {
        Taro.showToast({
          title: '微信号已复制',
          icon: 'success'
        });
      }
    });
  };

  const handleSendEmail = () => {
    Taro.setClipboardData({
      data: 'service@watertransport.com',
      success: () => {
        Taro.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      }
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.icon}>📞</Text>
        <Text className={styles.title}>客服中心</Text>
        <Text className={styles.subtitle}>我们随时为您服务</Text>
      </View>

      <View className={styles.contactCard}>
        <View className={styles.contactItem}>
          <View className={styles.contactIcon}>
            <Text className={styles.contactIconText}>📱</Text>
          </View>
          <View className={styles.contactInfo}>
            <Text className={styles.contactLabel}>客服热线</Text>
            <Text className={styles.contactValue}>400-888-8888</Text>
          </View>
          <Button className={styles.contactBtn} onClick={handleCall}>
            拨打
          </Button>
        </View>

        <View className={styles.contactItem}>
          <View className={styles.contactIcon}>
            <Text className={styles.contactIconText}>💬</Text>
          </View>
          <View className={styles.contactInfo}>
            <Text className={styles.contactLabel}>微信客服</Text>
            <Text className={styles.contactValue}>water_transport_cs</Text>
          </View>
          <Button className={styles.contactBtn} onClick={handleCopyWechat}>
            复制
          </Button>
        </View>

        <View className={styles.contactItem}>
          <View className={styles.contactIcon}>
            <Text className={styles.contactIconText}>📧</Text>
          </View>
          <View className={styles.contactInfo}>
            <Text className={styles.contactLabel}>电子邮箱</Text>
            <Text className={styles.contactValue}>service@watertransport.com</Text>
          </View>
          <Button className={styles.contactBtn} onClick={handleSendEmail}>
            复制
          </Button>
        </View>
      </View>

      <View className={styles.serviceHours}>
        <Text className={styles.serviceHoursText}>
          🕐 服务时间：周一至周日 8:00 - 20:00
        </Text>
      </View>

      <Text className={styles.sectionTitle}>常见问题</Text>
      <View className={styles.faqCard}>
        {faqList.map((faq, index) => (
          <View key={index} className={styles.faqItem}>
            <Text className={styles.faqQuestion}>Q: {faq.question}</Text>
            <Text className={styles.faqAnswer}>A: {faq.answer}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default CustomerServicePage;
