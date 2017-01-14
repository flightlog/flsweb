var express = require('express');
var app = express();
var api = "/api/v1";

app.post(api + "/locations/page/:pageStart/:pageSize", function (req, res) {
    res.send({
        TotalRows: 500,
        Items: [
            {
                LocationName: "Mock-Location"
            }
        ]
    });
});
app.get(api + "/translations", function (req, res) {
    res.send({});
});
app.get(api + "/users/my", function (req, res) {
    res.send({
        UserRoleIds: [1]
    });
});
app.get(api + "/userroles", function (req, res) {
    res.send([{
        RoleId: 1,
        RoleApplicationKeyString: "ClubAdministrator"
    }]);
});
app.post('/Token', function (req, res) {
    res.send({
        access_token: "mock-token"
    });
});

app.listen(25567, function () {
    console.log('Mock Server listening on port 25567!')
});