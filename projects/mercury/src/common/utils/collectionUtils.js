import {projectPrefix} from "../../projects/projects";

export const getCollectionAbsolutePath = (location) => projectPrefix() + (location ? `/collections/${location}` : '');
