"use client";
import React from "react";

/**
 * Split options into sections by their first word when several share it,
 * e.g. "Onigiri Salmon", "Onigiri Tuna" → section "Onigiri" with "Salmon", "Tuna".
 * Options with a unique first word (e.g. "Edamame") go into a final "More" section.
 * @returns {Array<{title: string|null, options: Array<{modifier, label}>}>}
 */
function groupOptionsByPrefix(modifiers) {
  const firstWord = (name) => name.trim().split(/\s+/)[0];
  const prefixCounts = modifiers.reduce((counts, m) => {
    const word = firstWord(m.name);
    counts[word] = (counts[word] || 0) + 1;
    return counts;
  }, {});

  const sections = new Map();
  const others = [];
  modifiers.forEach(modifier => {
    const word = firstWord(modifier.name);
    const rest = modifier.name.trim().slice(word.length).trim();
    if (prefixCounts[word] > 1 && rest) {
      if (!sections.has(word)) sections.set(word, []);
      sections.get(word).push({ modifier, label: rest });
    } else {
      others.push({ modifier, label: modifier.name });
    }
  });

  // No shared prefixes (e.g. roll names) → one untitled list
  if (sections.size === 0) return [{ title: null, options: others }];

  const result = [...sections.entries()].map(([title, options]) => ({ title, options }));
  if (others.length > 0) result.push({ title: "More", options: others });
  return result;
}

/**
 * Picker for modifier lists that need several selections (e.g. "Choose your rolls" - pick 3)
 * Each option has its own −/+ counter; the total is capped at the group's max
 */
const ModifierQuantityPicker = ({ group, counts = {}, onChange }) => {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const isFull = group.maxSelected > 0 && total >= group.maxSelected;
  const sections = groupOptionsByPrefix(group.modifiers);

  return (
    <div className="space-y-4">
      {sections.map(section => (
        <div key={section.title || "all"}>
          {section.title && (
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">{section.title}</h4>
          )}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {section.options.map(({ modifier, label }) => {
              const count = counts[modifier.id] || 0;
              const canAdd = !isFull && (group.allowQuantities || count === 0);

              return (
                <li
                  key={modifier.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border pl-3 transition-colors ${count > 0 ? "border-hot-pink bg-hot-pink/5" : "border-gray-200 bg-white"}`}
                >
                  <span className={`text-sm ${count > 0 ? "font-semibold text-hot-pink" : "text-gray-800"}`}>
                    {label}
                    {modifier.price > 0 && (
                      <span className="text-xs text-gray-500 ml-1">(+£{modifier.price.toFixed(2)})</span>
                    )}
                  </span>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => onChange(modifier.id, -1)}
                      disabled={count === 0}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-lg font-bold text-gray-600 cursor-pointer active:text-hot-pink md:hover:text-hot-pink disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={`Remove ${modifier.name}`}
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{count}</span>
                    <button
                      type="button"
                      onClick={() => onChange(modifier.id, 1)}
                      disabled={!canAdd}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-lg font-bold text-hot-pink cursor-pointer active:opacity-70 md:hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={`Add ${modifier.name}`}
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ModifierQuantityPicker;
