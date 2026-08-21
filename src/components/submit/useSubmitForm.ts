import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  createEmptyForm,
  submitResource,
  SubmitValidationError,
  type ActiveTab,
  type CategoryOption,
  type McpSubtype,
  type SubmitFormData,
} from './form';

export function useSubmitForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<ActiveTab>('tool');
  const [mcpSubtype, setMcpSubtype] = useState<McpSubtype>('server');
  const [data, setData] = useState<SubmitFormData>(createEmptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [availableCategories, setAvailableCategories] = useState<
    CategoryOption[]
  >([]);

  useEffect(() => {
    fetch('/api/filters')
      .then(res => res.json())
      .then(payload => {
        if (payload.categories) setAvailableCategories(payload.categories);
      })
      .catch(console.error);
  }, []);

  const updateField = <K extends keyof SubmitFormData>(
    key: K,
    value: SubmitFormData[K]
  ) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const toggleAgent = (agent: string) => {
    setData(prev => ({
      ...prev,
      compatibleAgents: prev.compatibleAgents.includes(agent)
        ? prev.compatibleAgents.filter(a => a !== agent)
        : [...prev.compatibleAgents, agent],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitResource(data, activeTab, mcpSubtype);
      setSuccess(true);
      setData(createEmptyForm());
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to submit. Please try again.';
      setError(message);
      if (!(err instanceof SubmitValidationError)) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  return {
    user,
    goToLogin,
    success,
    resetSuccess: () => setSuccess(false),
    activeTab,
    setActiveTab,
    mcpSubtype,
    setMcpSubtype,
    data,
    loading,
    error,
    availableCategories,
    updateField,
    toggleAgent,
    handleSubmit,
  };
}
