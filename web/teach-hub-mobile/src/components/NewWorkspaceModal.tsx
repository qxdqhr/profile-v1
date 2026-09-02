import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';

import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import { importWorkspaceZipFromUri } from '../utils/importWorkspaceZip';
import { Input, Modal, ModalCancelButton, ModalPrimaryButton } from '../ui';
import { thDesc } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  navigation: Nav;
};

/** 对齐 teach-hub-core NewWorkspaceModal */
export function NewWorkspaceModal({ visible, onClose, onCreated, navigation }: Props) {
  const { teachHubApi } = useAuth();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [why, setWhy] = useState('');
  const [zipAsset, setZipAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setTopic('');
    setWhy('');
    setZipAsset(null);
    setError('');
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const pickZip = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/zip', 'application/x-zip-compressed'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setZipAsset(result.assets[0]);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('请填写工作区标题');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const workspace = await teachHubApi.createWorkspace({
        title: title.trim(),
        topic: topic.trim() || undefined,
        missionDraft: why.trim() ? { why: why.trim() } : undefined,
      });

      if (zipAsset) {
        await importWorkspaceZipFromUri(teachHubApi, workspace.id, zipAsset);
      }

      onCreated();
      handleClose();
      navigation.navigate('Workspace', {
        workspaceId: workspace.id,
        title: workspace.title,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="新建学习工作区"
      onClose={handleClose}
      dismissOnBackdrop={!loading}
      footer={
        <>
          <ModalCancelButton onPress={handleClose} disabled={loading} />
          <ModalPrimaryButton
            label="创建工作区"
            loading={loading}
            disabled={loading}
            onPress={() => void handleCreate()}
          />
        </>
      }
    >
      <View className="gap-4">
        <View className="gap-1.5">
          <Text className="text-[15px] font-semibold text-[#794f27]">标题 *</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="例如：音乐乐理"
            editable={!loading}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-[15px] font-semibold text-[#794f27]">主题标签（可选）</Text>
          <Input
            value={topic}
            onChangeText={setTopic}
            placeholder="music-theory"
            editable={!loading}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-[15px] font-semibold text-[#794f27]">Mission — 你为什么想学？（可选）</Text>
          <Input
            multiline
            value={why}
            onChangeText={setWhy}
            placeholder="例如：想能看懂谱子并弹吉他…"
            editable={!loading}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-[15px] font-semibold text-[#794f27]">导入已有工作区 zip（可选）</Text>
          <Pressable onPress={() => void pickZip()} disabled={loading}>
            <Text className={`${thDesc} ${loading ? 'opacity-50' : ''}`}>
              {zipAsset?.name ? `已选：${zipAsset.name}（点击更换）` : '点击选择 zip 文件'}
            </Text>
          </Pressable>
        </View>

        {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
      </View>
    </Modal>
  );
}
