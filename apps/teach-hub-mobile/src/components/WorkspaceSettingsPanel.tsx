import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';

import { ReaderPositionPicker } from './ReaderPositionPicker';
import { ThSwitchRow } from './ThSwitchRow';
import { useAuth } from '../auth/AuthContext';
import {
  LESSON_READER_POSITION_OPTIONS,
  useLessonReaderSettings,
  type LessonReaderBarPosition,
} from '../hooks/useLessonReaderSettings';
import type { RootStackParamList } from '../navigation';
import { importWorkspaceZipFromUri } from '../utils/importWorkspaceZip';
import {
  WORKSPACE_META_PATH,
  buildWorkspaceMeta,
  composeWorkspaceMetaJson,
  parseWorkspaceMetaJson,
  patchWorkspaceMetaJson,
} from '../utils/workspaceMeta';
import { Button, Modal, ModalCancelButton, ModalPrimaryButton } from '../ui';
import { thDesc, thPanel } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Workspace'>;

type Props = {
  workspaceId: string;
  navigation: Nav;
};

/** 对齐 teach-hub-core SettingsPage */
export function WorkspaceSettingsPanel({ workspaceId, navigation }: Props) {
  const { teachHubApi } = useAuth();
  const { settings, setBarPosition, setBarExpanded } = useLessonReaderSettings();
  const [zipAsset, setZipAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [autoSyncLessonResources, setAutoSyncLessonResources] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaRaw, setMetaRaw] = useState('');

  useEffect(() => {
    let mounted = true;
    setMetaLoading(true);
    void teachHubApi
      .fetchWorkspaceFileText(workspaceId, WORKSPACE_META_PATH)
      .then((raw) => {
        if (!mounted) return;
        setMetaRaw(raw);
        setAutoSyncLessonResources(parseWorkspaceMetaJson(raw).autoSyncLessonResources === true);
      })
      .catch(() => {
        if (!mounted) return;
        setMetaRaw('');
        setAutoSyncLessonResources(false);
      })
      .finally(() => {
        if (mounted) setMetaLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [teachHubApi, workspaceId]);

  const handleAutoSyncChange = async (checked: boolean) => {
    setAutoSyncLessonResources(checked);
    setMetaSaving(true);
    setMessage('');
    try {
      let next: string;
      if (metaRaw.trim()) {
        next = patchWorkspaceMetaJson(metaRaw, { autoSyncLessonResources: checked });
      } else {
        const detail = await teachHubApi.fetchWorkspaceDetail(workspaceId);
        const ws = detail.workspace;
        next = composeWorkspaceMetaJson(
          buildWorkspaceMeta({
            title: ws?.title ?? '工作区',
            topic: ws?.topic ?? null,
            autoSyncLessonResources: checked,
          }),
        );
      }
      await teachHubApi.putWorkspaceFileText(workspaceId, WORKSPACE_META_PATH, next);
      setMetaRaw(next);
    } catch (err) {
      setAutoSyncLessonResources(!checked);
      setMessage(err instanceof Error ? err.message : '保存设置失败');
    } finally {
      setMetaSaving(false);
    }
  };

  const pickZip = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/zip', 'application/x-zip-compressed'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setZipAsset(result.assets[0]);
    setMessage('');
  };

  const handleImport = async () => {
    if (!zipAsset) {
      setMessage('请选择 zip 文件');
      return;
    }
    setImporting(true);
    setMessage('');
    try {
      const result = await importWorkspaceZipFromUri(teachHubApi, workspaceId, zipAsset);
      setMessage(
        `导入 ${result.importedFiles} 个文件，${result.lessonCount} 节课时` +
          (result.warnings.length ? `；提示：${result.warnings.join(' ')}` : ''),
      );
      setZipAsset(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '导入失败');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setMessage('');
    try {
      await teachHubApi.archiveWorkspace(workspaceId);
      setDeleteOpen(false);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '删除失败');
      setDeleting(false);
    }
  };

  return (
    <ScrollView contentContainerClassName="gap-4 pb-8" showsVerticalScrollIndicator={false}>
      <View className={`${thPanel} gap-3`}>
        <Text className="text-[15px] font-bold text-[#794f27]">阅读进度条</Text>
        <Text className={thDesc}>
          在课时阅读页显示阅读百分比与可拖动进度条。滚动正文时进度会自动更新；也可拖动进度条跳转位置。
        </Text>
        <ReaderPositionPicker
          value={settings.barPosition}
          onChange={(value: LessonReaderBarPosition) => void setBarPosition(value)}
        />
        <ThSwitchRow
          title="默认展开进度条"
          description="关闭后进入阅读页时进度条默认收起，仅显示百分比与展开按钮"
          value={settings.barExpanded}
          onValueChange={(checked) => void setBarExpanded(checked)}
        />
        <Text className="text-xs text-[#9f927d]">
          当前：
          {LESSON_READER_POSITION_OPTIONS.find((o) => o.value === settings.barPosition)?.label}
        </Text>
      </View>

      <View className={`${thPanel} gap-3`}>
        <Text className="text-[15px] font-bold text-[#794f27]">资源同步</Text>
        <Text className={thDesc}>
          开启后，Mimo 生成的新课时若包含「延伸阅读」外链，会自动追加到资源页的 RESOURCES.md。
        </Text>
        <ThSwitchRow
          title="自动将课程中的资源添加到资源 tab 中"
          description="仅对开启后新生成的课时生效；已存在的资源条目不会被删除"
          value={autoSyncLessonResources}
          onValueChange={(checked) => void handleAutoSyncChange(checked)}
          disabled={metaLoading || metaSaving}
        />
      </View>

      <View className={`${thPanel} gap-3`}>
        <Text className="text-[15px] font-bold text-[#794f27]">导入工作区</Text>
        <Text className={thDesc}>上传 teach 工作区 zip（如 musicStudy 打包），自动写入当前工作区。</Text>
        <Button type="default" size="small" onPress={() => void pickZip()}>
          {zipAsset?.name ? `已选：${zipAsset.name}` : '选择 zip 文件'}
        </Button>
        <Button
          type="primary"
          size="small"
          loading={importing}
          disabled={importing}
          onPress={() => void handleImport()}
        >
          {importing ? '导入中…' : '上传并导入'}
        </Button>
      </View>

      <View className="gap-3 rounded-[20px] border border-[#fed7d7] bg-[#fffafa] px-[18px] py-4">
        <Text className="text-[15px] font-bold text-red-700">删除工作区</Text>
        <Text className={thDesc}>从列表中移除此工作区，不会删除 OSS 中已上传的文件。</Text>
        <Button type="primary" size="small" danger onPress={() => setDeleteOpen(true)}>
          删除此工作区
        </Button>
      </View>

      {message ? <Text className="text-sm text-[#9f927d]">{message}</Text> : null}

      <Modal
        visible={deleteOpen}
        title="删除工作区"
        onClose={() => !deleting && setDeleteOpen(false)}
        dismissOnBackdrop={!deleting}
        footer={
          <>
            <ModalCancelButton onPress={() => setDeleteOpen(false)} disabled={deleting} />
            <ModalPrimaryButton
              label="确认删除"
              danger
              loading={deleting}
              disabled={deleting}
              onPress={() => void handleDelete()}
            />
          </>
        }
      >
        <Text className="text-sm leading-relaxed text-[#725d42]">
          确定删除此工作区？将从列表中移除，OSS 文件仍保留。
        </Text>
      </Modal>
    </ScrollView>
  );
}
