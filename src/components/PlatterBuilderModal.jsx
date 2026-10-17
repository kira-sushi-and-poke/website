"use client";
import React, { useState, useEffect } from "react";
import ModifierQuantityPicker from "./ModifierQuantityPicker";
import { countModifiers } from "@/lib/arrayUtils";

/**
 * Step-by-step pop-up for items with multi-pick modifier lists (e.g. "Build Your Own" platter).
 * One step per modifier list, then a review step. Selections reset after adding to the order.
 */
const PlatterBuilderModal = ({ isOpen, onClose, name, basePrice, modifierGroups = [], onAdd }) => {
    const [stepIndex, setStepIndex] = useState(0);
    // Multi-pick groups: { [groupId]: { [modifierId]: count } }; single groups: { [groupId]: { [modifierId]: 1 } }
    const [counts, setCounts] = useState({});
    const [isAdding, setIsAdding] = useState(false);

    const reviewStepIndex = modifierGroups.length;
    const isReviewStep = stepIndex === reviewStepIndex;
    const currentGroup = modifierGroups[stepIndex];

    const reset = () => {
        setStepIndex(0);
        setCounts({});
    };

    const handleClose = () => {
        if (isAdding) return;
        onClose();
    };

    // Lock page scroll and close on Escape while open
    useEffect(() => {
        if (!isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKeyDown = (e) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isAdding]);

    if (!isOpen) return null;

    const getGroupTotal = (group) =>
        Object.values(counts[group.id] || {}).reduce((sum, n) => sum + n, 0);

    const isGroupComplete = (group) => {
        const total = getGroupTotal(group);
        if (group.isMultiPick) return total >= group.minSelected;
        return !group.required || total === 1;
    };

    const changeCount = (groupId, modifierId, delta) => {
        setCounts(prev => {
            const groupCounts = { ...(prev[groupId] || {}) };
            groupCounts[modifierId] = Math.max(0, (groupCounts[modifierId] || 0) + delta);
            return { ...prev, [groupId]: groupCounts };
        });
    };

    // Single-pick groups replace the selection; null clears it ("None")
    const selectSingle = (groupId, modifierId) => {
        setCounts(prev => ({ ...prev, [groupId]: modifierId ? { [modifierId]: 1 } : {} }));
    };

    // Modifier IDs repeated for quantity, in group order
    const selectedModifiers = modifierGroups.flatMap(group =>
        Object.entries(counts[group.id] || {}).flatMap(([modifierId, count]) => Array(count).fill(modifierId))
    );
    const allModifiers = modifierGroups.flatMap(group => group.modifiers);
    const findModifier = (modifierId) => allModifiers.find(m => m.id === modifierId);
    const totalPrice = basePrice + selectedModifiers.reduce((sum, id) => sum + (findModifier(id)?.price || 0), 0);

    const describeGroup = (group) => {
        const groupIds = Object.entries(counts[group.id] || {}).flatMap(([id, n]) => Array(n).fill(id));
        if (groupIds.length === 0) return "None";
        return Object.entries(countModifiers(groupIds))
            .map(([id, n]) => `${n > 1 ? `${n}× ` : ""}${findModifier(id)?.name || id}`)
            .join(", ");
    };

    const handleAdd = async () => {
        setIsAdding(true);
        const success = await onAdd(selectedModifiers.length > 0 ? selectedModifiers : undefined);
        setIsAdding(false);
        if (success !== false) {
            reset();
            onClose();
        }
    };

    const stepTarget = (group) => {
        if (!group.isMultiPick) return group.required ? "Pick 1" : "Optional";
        if (group.minSelected === group.maxSelected) return `Pick ${group.maxSelected}`;
        return group.maxSelected > 0 ? `Pick ${group.minSelected}–${group.maxSelected}` : `Pick at least ${group.minSelected}`;
    };

    const canContinue = isReviewStep || isGroupComplete(currentGroup);

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/60 flex items-end md:items-center justify-center md:p-4"
            onClick={handleClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="platter-builder-title"
                className="bg-white w-full md:max-w-2xl h-[100dvh] md:h-auto md:max-h-[90vh] md:rounded-xl shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-4 md:px-6 pt-4 pb-3 border-b border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {name} · Step {stepIndex + 1} of {reviewStepIndex + 1}
                            </p>
                            <h2 id="platter-builder-title" className="font-heading text-hot-pink text-xl md:text-2xl">
                                {isReviewStep ? "Review your platter" : currentGroup.name}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-500 active:bg-gray-100 md:hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <i className="fas fa-times text-lg"></i>
                        </button>
                    </div>

                    {/* Step progress */}
                    <div className="flex gap-1.5 mt-3">
                        {[...modifierGroups, null].map((group, i) => (
                            <div
                                key={group?.id || "review"}
                                className={`h-1.5 flex-1 rounded-full ${i < stepIndex ? "bg-hot-pink" : i === stepIndex ? "bg-hot-pink/60" : "bg-gray-200"}`}
                            />
                        ))}
                    </div>

                    {!isReviewStep && (
                        <div className="flex justify-between items-baseline mt-3 text-sm">
                            <span className="text-gray-600">{stepTarget(currentGroup)}</span>
                            {currentGroup.isMultiPick && (
                                <span className={`font-bold ${isGroupComplete(currentGroup) ? "text-green-600" : "text-hot-pink"}`}>
                                    {getGroupTotal(currentGroup)}
                                    {currentGroup.maxSelected > 0 ? ` / ${currentGroup.maxSelected}` : ""} selected
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
                    {isReviewStep ? (
                        <dl className="space-y-3">
                            {modifierGroups.map((group, i) => (
                                <div key={group.id} className="flex justify-between gap-3 border-b border-gray-100 pb-3">
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{group.name}</dt>
                                        <dd className="text-sm text-gray-900 mt-0.5">{describeGroup(group)}</dd>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStepIndex(i)}
                                        className="text-sm font-semibold text-hot-pink underline shrink-0 min-h-[44px] cursor-pointer"
                                    >
                                        Change
                                    </button>
                                </div>
                            ))}
                        </dl>
                    ) : currentGroup.isMultiPick ? (
                        <ModifierQuantityPicker
                            group={currentGroup}
                            counts={counts[currentGroup.id]}
                            onChange={(modifierId, delta) => changeCount(currentGroup.id, modifierId, delta)}
                        />
                    ) : (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {[...(currentGroup.required ? [] : [null]), ...currentGroup.modifiers].map(modifier => {
                                const isSelected = modifier
                                    ? (counts[currentGroup.id]?.[modifier.id] || 0) > 0
                                    : getGroupTotal(currentGroup) === 0;
                                return (
                                    <li key={modifier?.id || "none"}>
                                        <button
                                            type="button"
                                            onClick={() => selectSingle(currentGroup.id, modifier?.id || null)}
                                            className={`w-full min-h-[44px] px-3 rounded-lg border text-left text-sm cursor-pointer ${isSelected ? "border-hot-pink bg-hot-pink/5 font-semibold text-hot-pink" : "border-gray-200 text-gray-800"}`}
                                        >
                                            {modifier ? modifier.name : "None"}
                                            {modifier?.price > 0 && (
                                                <span className="text-xs text-gray-500 ml-1">(+£{modifier.price.toFixed(2)})</span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 md:px-6 py-3 border-t border-gray-200 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => (stepIndex === 0 ? handleClose() : setStepIndex(stepIndex - 1))}
                        disabled={isAdding}
                        className="min-h-[44px] px-4 rounded-full font-semibold text-gray-700 bg-gray-100 cursor-pointer active:bg-gray-200 md:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {stepIndex === 0 ? "Cancel" : "Back"}
                    </button>

                    {isReviewStep ? (
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={isAdding}
                            className="cursor-pointer min-h-[44px] px-5 rounded-full font-bold text-white bg-hot-pink active:bg-opacity-80 md:hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isAdding && (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            )}
                            Add to order · £{totalPrice.toFixed(2)}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setStepIndex(stepIndex + 1)}
                            disabled={!canContinue}
                            className="min-h-[44px] px-5 rounded-full font-bold text-white bg-hot-pink cursor-pointer active:bg-opacity-80 md:hover:bg-opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlatterBuilderModal;
