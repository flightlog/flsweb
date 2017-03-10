var express = require('express');
var app = express();
var api = "/api/v1";

app.post(api + "/locations/page/:pageStart/:pageSize", function (req, res) {
    res.send(require("./mock-data/locations.json"));
});

app.post(api + "/accountingrulefilters/page/:pageStart/:pageSize", function (req, res) {
    res.send(require("./mock-data/accountingrulefilters.json"));
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
