---
"@promster/express": minor
"@promster/fastify": minor
"@promster/hapi": minor
"@promster/marblejs": minor
"@promster/metrics": minor
"@promster/types": minor
---

Add content length metric for both requests and responses. Both are recorded as Prometheus histograms under the name `http_request_content_length_bytes`
and `http_response_content_length_bytes`.
