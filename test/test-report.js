var expect  = require('chai').expect;
var request = require('request');

var testUrl = process.env.TEST_URL

console.log("Test Started!");
it('Main page content', function(done) {
    request('testUrl' , function(error, response, body) {
        console.log(body);
        expect(body).to.contain('Reporting UI');
        done();
    });
});
