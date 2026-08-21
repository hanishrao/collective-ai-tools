import { useSubmitForm } from './submit/useSubmitForm';
import { SubmitToolForm } from './submit/SubmitToolForm';
import { SignInPrompt, SubmissionSuccess } from './submit/views';

export default function SubmitTool() {
  const form = useSubmitForm();

  if (!form.user) {
    return <SignInPrompt onSignIn={form.goToLogin} />;
  }

  if (form.success) {
    return <SubmissionSuccess onSubmitAnother={form.resetSuccess} />;
  }

  return (
    <SubmitToolForm
      activeTab={form.activeTab}
      mcpSubtype={form.mcpSubtype}
      data={form.data}
      loading={form.loading}
      error={form.error}
      availableCategories={form.availableCategories}
      onTabChange={form.setActiveTab}
      onMcpSubtypeChange={form.setMcpSubtype}
      onChange={form.updateField}
      onToggleAgent={form.toggleAgent}
      onSubmit={form.handleSubmit}
    />
  );
}
