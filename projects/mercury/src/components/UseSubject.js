import queryString from "query-string";

const UseSubject = () => !!document.location.search && decodeURIComponent(queryString.parse(document.location.search).iri);

export default UseSubject;
