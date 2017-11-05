var express = require('express');
var app = express();
var api = "/api/v1";

app.post(api + "/locations/page/:pageStart/:pageSize", function (req, res) {
    res.send(require("./mock-data/locations.json"));
});

app.post(api + "/accountingrulefilters/page/:pageStart/:pageSize", function (req, res) {
    let filters = require("./mock-data/accountingrulefilters.json");
    let moreFilters = {Items:[]};
    for(let i = 0; i < 100; i++) {
        moreFilters.Items.push(Object.assign({}, filters[0], {AccountingRuleFilterId: i}));
    }
    res.send(moreFilters);
});
app.get(api + "/accountingrulefilters/:id", function (req, res) {
    res.send(require("./mock-data/accountingrulefilter-detail.json"));
});
app.get(api + "/translations", function (req, res) {
    res.send(require("./mock-data/translations.json"));
});
app.get(api + "/users/my", function (req, res) {
    res.send(require("./mock-data/user-testclubadmin.json"));
});
app.get(api + "/userroles", function (req, res) {
    res.send(require("./mock-data/userroles-testclubadmin.json"));
});
app.get(api + "/accountingrulefiltertypes", function(req, res) { res.send([]); });
app.get(api + "/aircrafts/overview", function(req, res) { res.send([]); });
app.get(api + "/flighttypes/overview", function(req, res) { res.send([]); });
app.get(api + "/locations", function(req, res) { res.send([]); });
app.get(api + "/articles", function(req, res) { res.send([]); });
app.get(api + "/persons", function(req, res) { res.send([]); });
app.post(api + "/personCategories", function(req, res) { res.send([]); });
app.get(api + "/personCategories", function(req, res) { res.send([{
    "PersonCategoryId": "b50642c8-d5f2-4291-8611-4d506aa42e40",
    "CategoryName": "Active member",
    "Id": "b50642c8-d5f2-4291-8611-4d506aa42e40",
    "CanUpdateRecord": true,
    "CanDeleteRecord": true
}, {
    "PersonCategoryId": "15deec63-8457-4f77-9d6d-077e2458bed6",
    "CategoryName": "Passant",
    "Id": "15deec63-8457-4f77-9d6d-077e2458bed6",
    "CanUpdateRecord": true,
    "CanDeleteRecord": true
}, {
    "PersonCategoryId": "a6e58034-3ea4-4ad5-99c4-3815be3bea53",
    "CategoryName": "Gliderpilots",
    "ParentPersonCategoryId": "b50642c8-d5f2-4291-8611-4d506aa42e40",
    "Id": "a6e58034-3ea4-4ad5-99c4-3815be3bea53",
    "CanUpdateRecord": true,
    "CanDeleteRecord": true
}, {
    "PersonCategoryId": "6475fec8-f756-4ebd-96f9-2b85fafce997",
    "CategoryName": "Motorpilots",
    "ParentPersonCategoryId": "b50642c8-d5f2-4291-8611-4d506aa42e40",
    "Id": "6475fec8-f756-4ebd-96f9-2b85fafce997",
    "CanUpdateRecord": true,
    "CanDeleteRecord": true
}]); });

app.post('/Token', function (req, res) {
    res.send({
        "access_token": "test-token",
        "token_type": "bearer",
        "userName": "testclubadmin"
    });
});

app.listen(25567, function () {
    console.log('Mock Server listening on port 25567!')
});
