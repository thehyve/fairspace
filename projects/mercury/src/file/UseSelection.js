import {useState} from 'react';

/**
 * This hook contains logic about selections.
 * @param allowMultiple Flag indicating whether multiple items can be selected at a time
 */
const useSelection = (allowMultiple) => {
    const [selected, setSelected] = useState([]);

    const select = item => (
        allowMultiple
            ? setSelected(currentSelection => [...currentSelection, item])
            : setSelected([item])
    );
    const deselect = item => setSelected(currentSelection => currentSelection.filter(el => el !== item));
    const isSelected = item => selected.some(el => el === item);
    const toggle = item => (isSelected(item) ? deselect(item) : select(item));
    const selectAll = items => { if (allowMultiple) setSelected(items); };
    const deselectAll = () => setSelected([]);

    return {
        select,
        deselect,
        selectAll,
        deselectAll,
        isSelected,
        toggle,
        selected: allowMultiple ? selected : selected[0]
    };
};

// Convenience methods indicating the use of selection
export const useSingleSelection = () => useSelection(false);
export const useMultipleSelection = () => useSelection(true);
