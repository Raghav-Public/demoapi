'use strict';

const Hapi = require('hapi');
const hapiAuthJWT = require('hapi-auth-jwt2');
const jwksRsa = require('jwks-rsa');

var config = require('./config').config;

const server=Hapi.server({
    host:'localhost',
    routes: {
        "cors": {
            origin: ["*"],
            headers: ["Accept", "Content-Type"],
            additionalHeaders: ["X-Requested-With"]
        }
    },
    port:8000
});

// Add the route
const registerRoutes = () => {
    server.route({
        method:'GET',
        path:'/api/v1/items',
        handler:function(request,h) {
            return [
                {
                    id: 1,
                    name: "sample1"
                },
                {
                    id: 2,
                    name: "sample2"
                }
            ];
        }
    });
}

const init = async() => {
    await server.register(hapiAuthJWT);
    server.auth.strategy('auth_jwk', 'jwt', {
        complete: true,
        key: jwksRsa.hapiJwt2KeyAsync({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: config.jwksUri,
        }),
        validate: function(decoded) {
          // TODO: Implement a validation
          console.log(decoded);
          if(decoded.appid == config.appid) {
            return {
                isValid: true,
              };
          }
          return {
            isValid: false,
          };
        },
        headerKey: 'authorization',
        tokenType: 'Bearer',
        verifyOptions: {
          issuer: config.issuer,
          algorithms: ['RS256'],
        },
      });
  
    
  
    registerRoutes();
    server.auth.default('auth_jwk');
    await server.start();
    return server;
  
  };
  
  init().then(server => {
    console.log('Server running at:', server.info.uri);
  }).catch(err => {
    console.log(err);
  });