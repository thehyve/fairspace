import { useEffect } from 'react';
import versionInfo from '../VersionInfo';

const separator = '-';

const UsePageTitleUpdater = title => {
    useEffect(() => {
        document.title = title ? `${title} ${separator} ${versionInfo.name}` : versionInfo.name;
    }, [title]);
};

export const UpdatePageTitleEditingMark = editing => {
    useEffect(() => {
        if (editing && !document.title.startsWith('* ')) {
            document.title = `* ${document.title}`;
        } else if (!editing && document.title.startsWith('* ')) {
            document.title = document.title.substring(2);
        }
        return () => {
            if (document.title.startsWith('* ')) {
                document.title = document.title.substring(2);
            }
        };
    }, [editing]);
};

export default UsePageTitleUpdater;
