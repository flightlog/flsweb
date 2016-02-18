export default class StringUtils {
    contains(haystack, needle) {
        return haystack && ('' + haystack).toLowerCase().indexOf(('' + needle).toLowerCase()) > -1;
    }
}