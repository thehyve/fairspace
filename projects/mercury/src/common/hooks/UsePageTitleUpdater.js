import {useEffect} from 'react';
import versionInfo from '../VersionInfo';

const separator = '-';

const UsePageTitleUpdater = title => {
    useEffect(() => {
        document.title = title ? `${title} ${separator} ${versionInfo.name}` : versionInfo.name;
    }, [title]);
};

export default UsePageTitleUpdater;
