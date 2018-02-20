var express = require("express");
var app = express();

var nib = require('nib')

app.set('views', __dirname+'/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(express.static(__dirname+'/public'))

var port   = process.env.API_PORT || '80';
var domain   = process.env.API_DOMAIN || "storemanagerwlp.mybluemix.net";
var context   = process.env.API_CONTEXT || "";
var uiVersion = process.env.IMAGE_VERSION || "NA";
var envTarget = process.env.ENV_TARGET || "NA";

console.log("API_PORT="+port);
console.log("API_DOMAIN="+domain);
console.log("API_CONTEXT="+context);
console.log("IMAGE_VERSION="+uiVersion);
console.log("ENV_TARGET="+envTarget);
console.log("full context = http://"+domain+":"+port+context);

app.get('/alternative.html', function (req, res) {
  processRequest(req, res, "index-simple");
})

app.get('/', function (req, res) {
  processRequest(req, res, "index");
})

function processRequest (req, res, page) {
  var nbRequests = 0;
  var dataset0;
  var dataset1;
  var dataset2;
  var version;

  restCall (context+"/resources/api/data/sales_expenses", 0);
  restCall (context+"/resources/api/data/sales_by_country", 1);
  restCall (context+"/resources/api/data/sales_by_product", 2);

  function restCall(url, dataToUpdate) {
    console.log(url);
    var http = require('http');

    var options = {
      host: domain,
      port: port,
      path: url
    };

    callback = function(rps) {
          var str = '';

          //another chunk of data has been recieved, so append it to `str`
          rps.on('data', function (chunk) {
            str += chunk;
          });

          //Here we make 3 requests and wait for results for all 3
          rps.on('end', function () {
                console.log(str);
                nbRequests+=1;
                var data = JSON.parse(str);
                if (dataToUpdate == 0) {
                    dataset0 = data.data.toString();
                }
                else if (dataToUpdate == 1) {
                    dataset1 = data.data.toString();
                }
                else if (dataToUpdate == 2) {
                    dataset2 = data.data.toString();
                }
                if (nbRequests == 3) {
                  getVersion();
                }
          });
    }

    http.request(options, callback).end();
  }

  function getVersion() {
        var http = require('http');

        var options = {
          host: domain,
          port: port,
          path: context+"/resources/api/version"
        };

        callback = function(rps) {
                var str = '';

                //another chunk of data has been recieved, so append it to `str`
                rps.on('data', function (chunk) {
                  str += chunk;
                });

                //the whole response has been recieved, so we just print it out here
                rps.on('end', function () {
                    var data = JSON.parse(str);
                      console.log(data);
                      res.render(page,
                        { title : 'Reporting Dashboard',
                          graph : str ,
                          dataset0: dataset0,
                          dataset1: dataset1,
                          dataset2: dataset2,
                          version: data.version,
                          uiVersion: uiVersion,
                          envTarget: envTarget
                        }
                      )
                });
        }

        http.request(options, callback).end();
  }
}
app.listen(process.env.SERVICE_PORT || 8080)
