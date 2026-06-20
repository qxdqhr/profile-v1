export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Workspace: { workspaceId: string; title: string };
  Lesson: { workspaceId: string; slug: string; title?: string };
  Reference: { workspaceId: string; slug: string; title?: string };
  RecordDetail: { workspaceId: string; relativePath: string; title: string };
};
