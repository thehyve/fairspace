import {useDispatch, useSelector} from "react-redux";
import {deselectAllPaths, deselectPath, selectPath, selectPaths} from "../../actions/collectionBrowserActions";

/**
 * This hook contains logic about file path selections stored in redux
 *
 * TODO: Make this logic more generic to be reused in other places
 */
const useSelection = (items) => {
    const selected = useSelector(state => state.collectionBrowser.selectedPaths);
    const dispatch = useDispatch();

    const select = item => dispatch(selectPath(item));
    const deselect = item => dispatch(deselectPath(item));
    const selectAll = () => dispatch(selectPaths(items));
    const deselectAll = () => dispatch(deselectAllPaths());
    const isSelected = item => selected.some(el => el === item);
    const toggle = item => (isSelected(item) ? deselect(item) : select(item));

    return {
        select,
        deselect,
        selectAll,
        deselectAll,
        isSelected,
        toggle,
        selected
    };
};

export default useSelection;
