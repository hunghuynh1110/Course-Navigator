const unitValues = [
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

const unitShortNames = {
  day: 'd',
  hour: 'h',
  minute: 'm',
  second: 's',
};

export const onZeroActions = {
  show: 'show',
  hide: 'hide',
  hideUntilFirstNonZero: 'hideUntilFirstNonZero',
};

const format = (values, formatProps, formatFn) => {
  const { onZero } = formatProps || {};
  let seenNonZero = false;
  return values.reduce((prev, [unitName, value]) => {
    if (value === 0 && onZero === onZeroActions.hide) {
      return prev;
    }
    if (
      value === 0 &&
      onZero === onZeroActions.hideUntilFirstNonZero &&
      !seenNonZero
    ) {
      return prev;
    }
    if (value !== 0) {
      seenNonZero = true;
    }
    return prev + formatFn(value, unitName, formatProps);
  }, '');
};

const findUnitIndex = (unitName) => {
  return unitValues
    .map((item, index) => [item, index])
    .find(([[unit, val]]) => unit === unitName)?.[1];
};

/**
 * Converts seconds to a formatted duration string (e.g., "1d 23h 5m 6s")
 * @param {number} totalSeconds - The duration in seconds
 * @return {string} Formatted duration string
 */
function formatDuration(totalSeconds, formatProps) {
  const defaultFormatProps = {
    maxUnit: 'hour',
    minUnit: 'second',
    onZero: onZeroActions.hideUntilFirstNonZero,
  };
  formatProps = { ...defaultFormatProps, ...(formatProps || {}) };
  const {
    translationProps,
    customFormat,
    maxUnit,
    minUnit,
    onZero,
    numberFormat,
    renderNumber,
    renderUnit,
  } = formatProps;

  const { t, i18n: { language } = {} } = translationProps || {};

  if (!totalSeconds || isNaN(totalSeconds)) {
    return null;
  }

  const start = findUnitIndex(maxUnit);
  const end = findUnitIndex(minUnit);

  const values = unitValues
    .filter((item, index) => index >= start && index <= end)
    .map(([unitName, value]) => {
      const thisValue = Math.floor(totalSeconds / value);
      totalSeconds %= value;
      return [unitName, thisValue];
    });

  if (customFormat) {
    return format(values, formatProps, customFormat).trim();
  }

  if (translationProps) {
    return format(values, formatProps, (value, unitName) => {
      const unit = `${t(`common:timeUnits:${unitName}`).toLowerCase()}${language === 'en' && value > 1 ? 's' : ''}`;
      const number = numberFormat ? numberFormat(value) : value;
      return `${renderNumber ? renderNumber(number) : number} ${renderUnit ? renderUnit(unit) : unit} `;
    }).trim();
  }

  return format(values, formatProps, (value, unitName) => {
    const unit = unitShortNames[unitName];
    const number = numberFormat ? numberFormat(value) : value;
    return `${renderNumber ? renderNumber(number) : number}${renderUnit ? renderUnit(unit) : unit} `;
  }).trim();
}

export default formatDuration;
