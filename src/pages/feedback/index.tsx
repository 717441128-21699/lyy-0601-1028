import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea, Button, Image } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import PhotoUpload from '@/components/PhotoUpload';
import EmptyState from '@/components/EmptyState';
import { mockFeedbacks, feedbackTypeOptions } from '@/data/feedback';
import type { FeedbackRecord, FeedbackType } from '@/types';

const typeIcons: Record<string, string> = {
  damage: '📦',
  missing: '❓',
  document: '📄',
  other: '📋'
};

const FeedbackPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('damage');
  const [waybillNo, setWaybillNo] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  useDidShow(() => {
    loadFeedbacks();
  });

  usePullDownRefresh(() => {
    loadFeedbacks();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const loadFeedbacks = () => {
    setFeedbacks(mockFeedbacks);
    console.log('[FeedbackPage] 加载反馈记录');
  };

  const handleTabChange = (tab: 'submit' | 'history') => {
    setActiveTab(tab);
  };

  const handleTypeSelect = (type: FeedbackType) => {
    setFeedbackType(type);
  };

  const handleSubmit = () => {
    if (!waybillNo.trim()) {
      Taro.showToast({
        title: '请输入运单号',
        icon: 'none'
      });
      return;
    }
    if (!description.trim()) {
      Taro.showToast({
        title: '请填写问题描述',
        icon: 'none'
      });
      return;
    }

    Taro.showModal({
      title: '提示',
      content: '确认提交该反馈？',
      success: (res) => {
        if (res.confirm) {
          const typeText = feedbackTypeOptions.find(t => t.value === feedbackType)?.label || '其他问题';
          const newFeedback: FeedbackRecord = {
            id: `f${Date.now()}`,
            type: feedbackType,
            typeText,
            waybillNo: waybillNo.trim(),
            description: description.trim(),
            photos,
            status: 'pending',
            statusText: '待处理',
            createTime: new Date().toLocaleString('zh-CN')
          };

          setFeedbacks([newFeedback, ...feedbacks]);
          setFeedbackType('damage');
          setWaybillNo('');
          setDescription('');
          setPhotos([]);

          Taro.showToast({
            title: '提交成功',
            icon: 'success'
          });
          console.log('[FeedbackPage] 提交反馈:', newFeedback);

          setTimeout(() => {
            setActiveTab('history');
          }, 1500);
        }
      }
    });
  };

  const handleViewPhoto = (photo: string) => {
    Taro.previewImage({
      current: photo,
      urls: photos.length > 0 ? photos : [photo]
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>异常反馈</Text>
        <Text className={styles.pageSubtitle}>提交问题，我们会尽快处理</Text>
      </View>

      <View className={styles.tabs}>
        <Text
          className={classNames(styles.tabItem, { [styles.active]: activeTab === 'submit' })}
          onClick={() => handleTabChange('submit')}
        >
          提交反馈
        </Text>
        <Text
          className={classNames(styles.tabItem, { [styles.active]: activeTab === 'history' })}
          onClick={() => handleTabChange('history')}
        >
          反馈记录
        </Text>
      </View>

      {activeTab === 'submit' ? (
        <>
          <View className={styles.formCard}>
            <Text className={styles.formTitle}>反馈信息</Text>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>问题类型
              </Text>
              <View className={styles.typeOptions}>
                {feedbackTypeOptions.map(option => (
                  <Button
                    key={option.value}
                    className={classNames(styles.typeOption, {
                      [styles.selected]: feedbackType === option.value
                    })}
                    onClick={() => handleTypeSelect(option.value as FeedbackType)}
                  >
                    <Text className={styles.typeIcon}>
                      {typeIcons[option.value]}
                    </Text>
                    <Text className={styles.typeText}>{option.label}</Text>
                  </Button>
                ))}
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>运单号
              </Text>
              <View className={styles.inputWrapper}>
                <Input
                  className={styles.input}
                  placeholder="请输入运单号"
                  value={waybillNo}
                  onInput={(e) => setWaybillNo(e.detail.value)}
                />
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>问题描述
              </Text>
              <View className={styles.textareaWrapper}>
                <Textarea
                  className={styles.textarea}
                  placeholder="请详细描述您遇到的问题，包括时间、地点、具体情况等..."
                  value={description}
                  onInput={(e) => setDescription(e.detail.value.slice(0, 500))}
                  maxlength={500}
                />
                <Text className={styles.textCount}>{description.length}/500</Text>
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>上传照片（可选）</Text>
              <PhotoUpload photos={photos} onChange={setPhotos} />
            </View>
          </View>

          <Button className={styles.submitBtn} onClick={handleSubmit}>
            提交反馈
          </Button>
        </>
      ) : (
        <>
          <Text className={styles.sectionTitle}>反馈记录</Text>
          {feedbacks.length > 0 ? (
            <View className={styles.historyList}>
              {feedbacks.map(feedback => (
                <View key={feedback.id} className={styles.historyCard}>
                  <View className={styles.historyHeader}>
                    <View>
                      <Text className={styles.historyType}>
                        {typeIcons[feedback.type]} {feedback.typeText}
                      </Text>
                      <Text className={styles.historyWaybill}>运单号: {feedback.waybillNo}</Text>
                    </View>
                    <StatusBadge status={feedback.status} text={feedback.statusText} />
                  </View>

                  <Text className={styles.historyDesc}>{feedback.description}</Text>

                  {feedback.photos.length > 0 && (
                    <View className={styles.historyPhotos}>
                      {feedback.photos.map((photo, index) => (
                        <View
                          key={index}
                          className={styles.historyPhoto}
                          onClick={() => handleViewPhoto(photo)}
                        >
                          <Image
                            className={styles.historyPhotoImg}
                            src={photo}
                            mode="aspectFill"
                          />
                        </View>
                      ))}
                    </View>
                  )}

                  {feedback.reply && (
                    <View className={styles.replySection}>
                      <Text className={styles.replyLabel}>📋 官方回复</Text>
                      <Text className={styles.replyContent}>{feedback.reply}</Text>
                      {feedback.replyTime && (
                        <Text className={styles.replyTime}>{feedback.replyTime}</Text>
                      )}
                    </View>
                  )}

                  <View className={styles.historyFooter}>
                    <Text className={styles.historyTime}>{feedback.createTime}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptyWrapper}>
              <EmptyState
                icon="📝"
                title="暂无反馈记录"
                description="提交问题后可在此查看处理进度"
                actionText="去提交"
                onAction={() => handleTabChange('submit')}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default FeedbackPage;
