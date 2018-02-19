var express = require("express");
var app = express();

var nib = require('nib')

app.set('views', __dirname+'/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(express.static(__dirname+'/public'))

var port   = process.env.API_PORT;
var domain   = process.env.API_DOMAIN;
var context   = process.env.API_CONTEXT;

if (!context) {
    context="";
}

if (port && domain) {
    console.log("http://"+domain+":"+port+context);
}
else {
  domain = "storemanagerwlp.mybluemix.net";
  port= '80';
  console.log("http://"+domain+":"+port+context);
}


app.get('/', function (req, res) {

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
    host: domain ? domain : 'localhost',
    port: port ? port : '9080',
    path: url
  };

  callback = function(rps) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    rps.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
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
    host: domain ? domain : 'localhost',
    port: port ? port : '9080',
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
    res.render('index',
      { title : 'Reporting UI',
        graph : str ,
        dataset0: dataset0,
        dataset1: dataset1,
        dataset2: dataset2,
        version: data.version
      }
      )

    });
  }

  http.request(options, callback).end();
}

})
app.listen(process.env.SERVICE_PORT || 8080)
