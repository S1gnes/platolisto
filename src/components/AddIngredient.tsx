import { useId, useMemo, useRef, useState } from 'react';
import ui from '../styles/ui.module.css';
import { cx } from './cx';
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
  /** Focus the field on arrival (the "type what you have" entry). */
  autoFocus?: boolean;
}

/** A labelled text field with an Add button; matching catalog names appear below as one-tap chips. */
export function AddIngredient({ onAdd, suggest, addText, label, placeholder, suggestionsLabel, autoFocus }: Props) {
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

  return (
    <form
      className={s.form}
      onSubmit={(event) => {
        event.preventDefault();
        add(value);
      }}
    >
      <label htmlFor={inputId} className={ui.label}>
        {label}
      </label>
      <div className={s.field}>
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
          autoFocus={autoFocus}
        />
        <button type="submit" className={cx(ui.btn, ui.secondary, s.submit)} disabled={!value.trim()}>
          {addText}
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul className={s.suggestions} aria-label={suggestionsLabel}>
          {suggestions.map((suggestion) => (
            <li key={suggestion.key}>
              <button type="button" className={ui.chip} onClick={() => add(suggestion.name)}>
                <Icon name="plus" size={16} strokeWidth={2.2} />
                {suggestion.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
