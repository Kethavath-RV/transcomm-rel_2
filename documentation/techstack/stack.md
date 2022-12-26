# Project Tech Stack

|#|Segment|Used By Transcomm|Package Name|Custom built|Alternatives|URL|Comment|
|-|-|-|-|-|-|-|-|
|1|Build Tool|yarn, tsc|npm||yarn, babel||Yarn is becoming defacto due to its fast package installation.|
|2|Authentication|Passport js||Y|passportjs|||
|3|ORM|Prisma|sequelize||prisma|||
|4|Unit Testing|Jest||Y|mocha, chai, Jest|||
|5|Integration Testing|Postman, Jest|||postman, selenium, mocha, chai|||
|6|REST API  Integration|Nest/Express js|ExpressJS|Y|Nest JS||Basic methods are being used to integrate API. Nest Js is an opinionated framework developed on top of node js.|
|7|REST API Build/Semantics||WebPack||OpenAPI, PostMan,|
|8|HTTP Client|Axios|||Axios, Request|
|9|App Logging|Nest logger|Winston||||Centralized log server ?|
|10 |Permission & Access Layer|Passport, Authguards Nest|JWT|Y|passportjs||Mani to check and confirm|
|11|UI Frameworks|Angular 12|Angular 11||ElectronJS, REACT, REACT NATIVE, VUEJS, ELECTRODE|
|12|Process Manager|n/a|PM2||
|13|Debugger|Node inspector|Node Inspector||||not in use|
|14|Log Rotation|n/a|PM2 Log Rotator|
|15|Code Scanning|Sonar|Sonar|
|16|Static Code Analysis|Sonar|||Fortify||not in use|
|17|Developer Tools: vulnerabilities|Sonar, Yarn|||SNYK|
|18|Developer Tools: performance|n/a|||CLINIC|
|19|Configuration/Deployment Management|n/a|||Ansible, Puppet||Not in Use|
|20|CI/CD Pipeline|Azure Pipelines/devops|||Jenkins/ Azure Pipeline ||Not in Use|
|21|Containerization|Docker|||Docker,  Kubernetes||Not in Use|
|22|Encryption/Decryption/Encoding/Decoding Technique|sha512, sha256 (Node Crypto) BtoA AtoB(base64 encoding decoding)|sha2, cryptoJs, base64, utf8|
|23|Minify/combine/uglify||||yuicompressor|||UI - currently being with done with angular build|
|24|Localization - Languages/local services/custom preferences|n/a|||||Not in Use|
|25|GeoData Handling|n/a|||||Not in Use|
|26|Date Handling |date-fns, date-fns-tz|||moment|
|27|Document Generator|n/a|||JsDoc|
|28|email client|n/a|||nodeMailer|
|29|Fake Test Data Generator|n/a|||Faker|
|30|Environment Variable Handling|env/nest config service|||DotEnv||Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. Storing configuration in the environment separate from code|
|31|CORS Headers|Express Cors / Nest|||cors
|32|Socket Based Communications|Socket.io / Nest   |||Socket.io|
|33|Caching - Server side|n/a|||Redis|
|34|Caching - client side|localstorage|||localstorage , IndexedDB||alasql  ...  to be an option for multiple DB handings|
|35|Message Queue|Kafka.js|kafka-node||socket.io ?|
|36|Events Handler|nest/cqrs||