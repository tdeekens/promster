---
"@promster/express": patch
"@promster/fastify": patch
"@promster/hapi": patch
"@promster/marblejs": patch
"@promster/metrics": patch
"@promster/types": patch
---

Add content length metric for both requests and responses. Both are recorded as Prometheus histograms under the name `http_request_content_length_bytes`
and `http_response_content_length_bytes`.
