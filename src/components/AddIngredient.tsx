import { useId, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import s from './AddIngredient.module.css';

export interface AddSuggestion {
  key: string;
  name: string;
}

interface Props {
  onAdd: (text: string) => void;
  suggest: (query: string) => AddSuggestion[];
  addText: string;
  label: string;
  placeholder: string;
  suggestionsLabel: string;
  /** Open the text field straight away (type-what-you-have mode). */
  startOpen?: boolean;
}

/** "+ Add" chip that turns into a text field with catalog suggestions. */
export function AddIngredient({ onAdd, suggest, addText, label, placeholder, suggestionsLabel, startOpen }: Props) {
  const [open, setOpen] = useState(Boolean(startOpen));
  const [value, setValue] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const suggestions = useMemo(() => suggest(value), [suggest, value]);

  const add = (text: string) => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setValue('');
    input.current?.focus();
  };

  if (!open) {
    return (
      <button type="button" className={s.addBtn} onClick={() => setOpen(true)}>
        <Icon name="plus" size={14} strokeWidth={2.4} />
        {addText}
      </button>
    );
  }

  return (
    <form
      className={s.form}
      onSubmit={(event) => {
        event.preventDefault();
        add(value);
      }}
    >
      <label htmlFor={inputId} className="visually-hidden">
        {label}
      </label>
      <input
        id={inputId}
        ref={input}
        className={s.input}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="none"
        enterKeyHint="done"
        // The user just asked for the field, so focusing it is expected.
        autoFocus
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !value) setOpen(false);
        }}
      />
      <button type="submit" className={s.submit} aria-label={addText} disabled={!value.trim()}>
        <Icon name="plus" size={18} strokeWidth={2.4} />
      </button>
      {suggestions.length > 0 && (
        <ul className={s.suggestions} aria-label={suggestionsLabel}>
          {suggestions.map((suggestion) => (
            <li key={suggestion.key}>
              <button type="button" className={s.suggestion} onClick={() => add(suggestion.name)}>
                {suggestion.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
