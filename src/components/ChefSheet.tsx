import { useEffect, useId, useRef, useState } from 'react';
import { isPantry } from '../core/catalog';
import { recipeIngredientName } from '../core/display';
import type { Recipe } from '../core/types';
import { useT, type MessageKey } from '../i18n';
import { errorCode, streamChat, type ApiErrorCode, type ChatMessage } from '../services/api';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import { cx } from './cx';
import { Icon } from './Icon';
import { Modal } from './Modal';
import s from './ChefSheet.module.css';

const SUGGESTIONS: { label: MessageKey; prompt: MessageKey }[] = [
  { label: 'chef.suggest.swap', prompt: 'chef.prompt.swap' },
  { label: 'chef.suggest.spicy', prompt: 'chef.prompt.spicy' },
  { label: 'chef.suggest.scale', prompt: 'chef.prompt.scale' },
];

const ERRORS: Partial<Record<ApiErrorCode, MessageKey>> = {
  not_configured: 'chef.error.notConfigured',
  offline: 'chef.error.offline',
  rate_limited: 'chef.error.busy',
  quota: 'chef.error.busy',
  blocked: 'chef.error.blocked',
};

interface Props {
  open: boolean;
  onClose: () => void;
  recipe: Recipe;
  /** Ingredient keys the user already has. */
  have: string[];
}

/** AI chef chat (Plus). History stays in memory and resets per recipe. */
export function ChefSheet({ open, onClose, recipe, have }: Props) {
  const t = useT();
  const prefs = useApp((state) => state.prefs);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const abort = useRef<AbortController | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    setMessages([]);
    setError(null);
    return () => abort.current?.abort();
  }, [recipe.id]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const close = () => {
    abort.current?.abort();
    onClose();
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || streaming) return;
    const history: ChatMessage[] = [...messages, { role: 'user', text: question }];
    setMessages([...history, { role: 'model', text: '' }]);
    setDraft('');
    setError(null);
    setStreaming(true);
    const controller = new AbortController();
    abort.current = controller;
    let answer = '';
    try {
      await streamChat(
        history,
        {
          recipe: {
            title: t.pick(recipe.title),
            servings: recipe.servings,
            ingredients: recipe.ingredients.filter((i) => !isPantry(i.key)).map((i) => recipeIngredientName(recipe, i.key, t.lang)),
            steps: recipe.steps[t.lang].length ? recipe.steps[t.lang] : recipe.steps.en,
          },
          have: have.map((key) => recipeIngredientName(recipe, key, t.lang)),
          allergies: prefs.allergies,
          diet: prefs.diet,
        },
        t.lang,
        (chunk) => {
          answer += chunk;
          setMessages((current) => [...current.slice(0, -1), { role: 'model', text: answer }]);
        },
        controller.signal,
      );
      setAnnouncement(answer);
    } catch (failure) {
      if (controller.signal.aborted) return;
      setMessages((current) => (answer ? current : current.slice(0, -1)));
      setError(ERRORS[errorCode(failure)] ?? 'chef.error.failed');
    } finally {
      if (abort.current === controller) setStreaming(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title={t('chef.title')} className={s.sheet}>
      <div className={s.thread} ref={list}>
        {messages.length === 0 && <p className={s.intro}>{t('chef.intro', { title: t.pick(recipe.title) })}</p>}
        {messages.map((message, index) => (
          <div key={index} className={message.role === 'user' ? s.user : s.chef}>
            <span className="visually-hidden">{message.role === 'user' ? t('chef.you') : t('chef.name')}: </span>
            {message.text || (streaming && index === messages.length - 1 ? t('chef.thinking') : '')}
          </div>
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {streaming ? t('chef.thinking') : announcement}
      </p>
      {error && (
        <p className={s.error} role="alert">
          {t(error)}
        </p>
      )}

      <div className={s.suggestions} role="group" aria-label={t('chef.suggestions')}>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            className={cx(ui.chip, s.suggestion)}
            disabled={streaming}
            onClick={() => send(t(suggestion.prompt))}
          >
            {t(suggestion.label)}
          </button>
        ))}
      </div>

      <form
        className={s.form}
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
      >
        <label htmlFor={inputId} className="visually-hidden">
          {t('chef.inputLabel')}
        </label>
        <input
          id={inputId}
          className={s.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t('chef.placeholder')}
          maxLength={500}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button type="submit" className={s.send} aria-label={t('chef.send')} disabled={!draft.trim() || streaming}>
          <Icon name="send" size={20} />
        </button>
      </form>
      <p className={cx(ui.note, s.disclaimer)}>{t('chef.disclaimer')}</p>
    </Modal>
  );
}
