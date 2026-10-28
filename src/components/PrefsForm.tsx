import { config } from '../config';
import { ALLERGIES, DIETS, LOVES } from '../core/types';
import { useT } from '../i18n';
import { useApp } from '../state/store';
import ui from '../styles/ui.module.css';
import { cx } from './cx';
import s from './PrefsForm.module.css';

/** Food preference controls, shared by onboarding and the profile. */
export function PrefsForm() {
  const t = useT();
  const prefs = useApp((state) => state.prefs);
  const toggleAllergy = useApp((state) => state.toggleAllergy);
  const setDiet = useApp((state) => state.setDiet);
  const toggleLove = useApp((state) => state.toggleLove);
  const setBudget = useApp((state) => state.setBudget);
  const budget = t.priceShort(Math.round(prefs.budget * 100));

  return (
    <div className={s.form}>
      <fieldset className={s.group}>
        <legend className={ui.eyebrow}>{t('prefs.allergies')}</legend>
        <div className={ui.chips}>
          {ALLERGIES.map((allergy) => (
            <button
              key={allergy}
              type="button"
              className={cx(ui.chip, ui.chipPrimary)}
              aria-pressed={prefs.allergies.includes(allergy)}
              onClick={() => toggleAllergy(allergy)}
            >
              {t(`allergy.${allergy}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={s.group}>
        <legend className={ui.eyebrow}>{t('prefs.diet')}</legend>
        <div className={ui.chips}>
          {DIETS.map((diet) => (
            <button
              key={diet}
              type="button"
              className={cx(ui.chip, ui.chipOlive)}
              aria-pressed={prefs.diet === diet}
              onClick={() => setDiet(diet)}
            >
              {t(`diet.${diet}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={s.group}>
        <legend className={ui.eyebrow}>{t('prefs.loves')}</legend>
        <div className={ui.chips}>
          {LOVES.map((love) => (
            <button
              key={love}
              type="button"
              className={cx(ui.chip, ui.chipInk)}
              aria-pressed={prefs.loves.includes(love)}
              onClick={() => toggleLove(love)}
            >
              {t(`love.${love}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={s.group}>
        <div className={s.budgetHead}>
          <label htmlFor="budget" className={cx(ui.eyebrow, s.budgetLabel)}>
            {t('prefs.budget')}
          </label>
          <span className={s.budgetValue} aria-hidden="true">
            {budget}
          </span>
        </div>
        <input
          id="budget"
          type="range"
          className={s.range}
          min={config.budget.min}
          max={config.budget.max}
          step={config.budget.step}
          value={prefs.budget}
          aria-valuetext={t('prefs.budgetValue', { price: budget })}
          onChange={(event) => setBudget(Number(event.target.value))}
        />
      </div>
    </div>
  );
}
