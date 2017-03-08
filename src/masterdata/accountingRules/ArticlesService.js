export class ArticlesService {
    constructor($http, GLOBALS, MessageManager) {
        this.$http = $http;
        this.GLOBALS = GLOBALS;
        this.MessageManager = MessageManager;
    }

    getArticles() {
        return this.$http
            .get(`${this.GLOBALS.BASE_URL}/api/v1/articles`)
            .then((response) => {
                return response.data;
            })
            .catch(_.partial(this.MessageManager.raiseError, 'load', 'articles'));
    }
}
