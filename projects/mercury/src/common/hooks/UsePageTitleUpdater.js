import {useContext, useEffect} from 'react';
import VersionContext from '../contexts/VersionContext';

const separator = '-';

const UsePageTitleUpdater = title => {
    const {name} = useContext(VersionContext);

    useEffect(() => {
        document.title = title ? `${title} ${separator} ${name}` : name;
    }, [name, title]);
};

export default UsePageTitleUpdater;
