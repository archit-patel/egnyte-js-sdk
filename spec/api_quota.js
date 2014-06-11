   describe("API Quota handlers (unstable, may fail on lags)", function () {
       it('BTW. The test should have a working matcher for errors', function () {
           //token was passed in beforeEach
           expect(expect(this).toAutoFail).toBeDefined();
       });

       if (!window.egnyteDomain || !window.APIToken) {
           throw new Error("spec/conf/apiaccess.js is missing");
       }

       beforeEach(function () {
           jasmine.getEnv().defaultTimeoutInterval = 10000; //QA API can be laggy
           jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; //QA API can be laggy

       });


       it("should delay calls to fit QPS", function (done) {
           var t1 = (1 / 0),
               t2 = 0;
           var eg = Egnyte.init(egnyteDomain, {
               token: APIToken,
               QPS: 1
           });
           eg.API.storage.exists("/jiberish").then(function (e) {
               t1 = +new Date();
           }).error(function (e) {
               expect(this).toAutoFail(e);
           });

           eg.API.storage.exists("/jiberish").then(function (e) {
               t2 = +new Date();
               //assuming 404 is quite stable in terms of response time
               //but the response can be cached and the second one is faster
               expect(t2 - t1).toBeGreaterThan(500);
               done();
           }).error(function (e) {
               expect(this).toAutoFail(e);
           });

       });
       it("should not delay calls while under QPS", function (done) {
           var t1 = 0,
               t2 = 0;
           var eg = Egnyte.init(egnyteDomain, {
               token: APIToken,
               QPS: 2
           });
           eg.API.storage.exists("/jiberish").then(function (e) {
               t1 = +new Date();
           }).error(function (e) {
               expect(this).toAutoFail(e);
           });

           eg.API.storage.exists("/jiberish").then(function (e) {
               t2 = +new Date();
               //assuming 404 is quite stable in terms of response time
               //but the response can be cached and the second one is faster
               expect(!t1 || (t2 - t1) < 500).toBe(true);
               done();
           }).error(function (e) {
               expect(this).toAutoFail(e);
           });

       });

       it("should not delay calls after the second ended (can fail if connecting to API with QPS is below 2)", function (done) {

           var eg = Egnyte.init(egnyteDomain, {
               token: APIToken,
               QPS: 1
           });

           //filling up the query queue
           eg.API.storage.exists("/jiberish");

           setTimeout(function () {
               var t1 = 0,
                   t2 = 0;

               t1 = +new Date();
               eg.API.storage.exists("/jiberish").then(function (e) {
                   t2 = +new Date();
                   //assuming response comes in less than 800ms
                   expect(t2 - t1).toBeLessThan(800);
               }).error(function (e) {
                   expect(this).toAutoFail(e);
               });

           }, 1001);

           setTimeout(function () {
               var t1 = 0,
                   t2 = 0;

               t1 = +new Date();
               eg.API.storage.exists("/jiberish").then(function (e) {
                   t2 = +new Date();
                   //assuming response comes in less than 800ms
                   expect(t2 - t1).toBeGreaterThan(800);
                   done();
               }).error(function (e) {
                   expect(this).toAutoFail(e);
               });

           }, 1050);

       });
   });