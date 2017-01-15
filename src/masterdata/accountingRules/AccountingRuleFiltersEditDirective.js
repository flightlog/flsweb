import AccountingRuleFiltersEditController from './AccountingRuleFiltersEditController';

export default class AccountingRuleFiltersEditDirective {
    static factory() {
        return {
            template: require("./accountingRuleFilters-table.html"),
            controller: AccountingRuleFiltersEditController
        }
    }
}

