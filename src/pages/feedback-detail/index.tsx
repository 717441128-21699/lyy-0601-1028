import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import PhotoUpload from '@/components/PhotoUpload';
import type { FeedbackRecord, FeedbackHistory } from '@/types';

const FeedbackDetailPage: React.FC = () => {
  const router = useRouter();
  const { getFeedbackById, replyFeedback } = useAppStore();

  const [feedback, setFeedback] = useState<FeedbackRecord | null>(null);
  const [supplementContent, setSupplementContent] = useState('');
  const [supplementPhotos, setSupplementPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const feedbackId = router.params.id as string;

  const loadFeedback = useCallback(() => {
    if (!feedbackId) {
      Taro.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    const data = getFeedbackById(feedbackId);
    if (data) {
      setFeedback(data);
    } else {
      Taro.showToast({ title: '反馈不存在', icon: 'none' });
    }
  }, [feedbackId, getFeedbackById]);

  useDidShow(() => {
    loadFeedback();
  });

  usePullDownRefresh(() => {
    loadFeedback();
    Taro.stopPullDownRefresh();
  });

  const handlePreviewPhoto = (photo: string) => {
    Taro.previewImage({
      urls: [photo],
      current: photo
    });
  };

  const handleSubmitSupplement = async () => {
    if (!feedback) return;
    if (!supplementContent.trim() && supplementPhotos.length === 0) {
      Taro.showToast({ title: '请输入补充说明或上传照片', icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      const savedPhotos: string[] = [];
      for (const photo of supplementPhotos) {
        try {
          const saved = await Taro.saveFile({ tempFilePath: photo });
          savedPhotos.push(saved.savedFilePath);
        } catch {
          savedPhotos.push(photo);
        }
      }

      replyFeedback(
        feedback.id,
        supplementContent.trim(),
        savedPhotos.length > 0 ? savedPhotos : supplementPhotos
      );

      Taro.showToast({ title: '提交成功', icon: 'success' });
      setSupplementContent('');
      setSupplementPhotos([]);
      loadFeedback();
    } catch (error) {
      console.error('[FeedbackDetail] Submit supplement failed:', error);
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewWaybill = (waybillNo: string) => {
    Taro.switchTab({ url: '/pages/waybill/index' });
    setTimeout(() => {
      Taro.eventCenter.trigger('searchWaybill', { waybillNo });
    }, 300);
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: '#FF7D00',
      processing: '#0077C8',
      need_more: '#F53F3F',
      resolved: '#00B42A'
    };
    return colorMap[status] || '#86909C';
  };

  if (!feedback) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>加载中...</View>
      </View>
    );
  }

  const needsSupplement = feedback.status === 'need_more';

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.typeBadge}>{feedback.typeText}</View>
        <View
          className={styles.waybillNo}
          onClick={() => handleViewWaybill(feedback.waybillNo)}
        >
          运单号：{feedback.waybillNo}
        </View>
        <View className={styles.statusRow}>
          <View
            className={styles.statusBadge}
            style={{ backgroundColor: `${getStatusColor(feedback.status)}30` }}
          >
            <Text style={{ color: getStatusColor(feedback.status) }}>
              {feedback.statusText}
            </Text>
          </View>
          <Text className={styles.createTime}>
            提交时间：{feedback.createTime}
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.dot} />
          <Text>问题描述</Text>
        </View>
        <Text className={styles.description}>{feedback.description}</Text>
        {feedback.photos.length > 0 && (
          <View className={styles.photoGrid}>
            {feedback.photos.map((photo, index) => (
              <View
                key={index}
                className={styles.photoItem}
                onClick={() => handlePreviewPhoto(photo)}
              >
                <Image src={photo} mode='aspectFill' />
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.dot} />
          <Text>处理流转</Text>
        </View>
        <View className={styles.timeline}>
          {[...feedback.history].reverse().map((item: FeedbackHistory) => (
            <View key={item.id} className={styles.timelineItem}>
              <View className={classnames(styles.timelineDot, styles[item.action])} />
              <View className={styles.timelineHeader}>
                <Text className={styles.timelineAction}>{item.actionText}</Text>
                <Text className={styles.timelineOperator}>{item.operator}</Text>
              </View>
              <Text className={styles.timelineTime}>{item.time}</Text>
              <Text className={styles.timelineContent}>{item.content}</Text>
              {item.photos && item.photos.length > 0 && (
                <View className={styles.timelinePhotos}>
                  {item.photos.map((photo, index) => (
                    <Image
                      key={index}
                      className={styles.timelinePhoto}
                      src={photo}
                      mode='aspectFill'
                      onClick={() => handlePreviewPhoto(photo)}
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {feedback.reply && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <View className={styles.dot} />
            <Text>最新回复</Text>
          </View>
          <View className={styles.replySection}>
            <Text className={styles.replyTitle}>客服回复</Text>
            {feedback.replyTime && (
              <Text className={styles.replyTime}>{feedback.replyTime}</Text>
            )}
            <Text className={styles.replyContent}>{feedback.reply}</Text>
          </View>
        </View>
      )}

      {needsSupplement && (
        <View className={styles.supplementForm}>
          <Text className={styles.supplementTitle}>请补充材料</Text>
          <View className={styles.uploadSection}>
            <PhotoUpload
              value={supplementPhotos}
              onChange={setSupplementPhotos}
              maxCount={9}
            />
          </View>
          <Textarea
            className={styles.supplementInput}
            placeholder='请输入补充说明...'
            value={supplementContent}
            onInput={(e) => setSupplementContent(e.detail.value)}
            maxlength={500}
          />
          <View className={styles.supplementActions}>
            <View
              className={classnames(styles.submitBtn, submitting && styles.disabled)}
              onClick={!submitting ? handleSubmitSupplement : undefined}
            >
              {submitting ? '提交中...' : '提交补充'}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default FeedbackDetailPage;
