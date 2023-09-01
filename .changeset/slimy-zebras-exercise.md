---
'@promster/marblejs': minor
'@promster/express': minor
'@promster/fastify': minor
'@promster/apollo': minor
'@promster/hapi': minor
---

Add support for generics to skip function.

The `skip` function now supports generics for cases in which you have extended the request and response type in your application. The generics default to each framework's request and response type. If you need to overwrite this pass the generics as in `skip<MyRequestType, MyResponseType>(request, response)`.
