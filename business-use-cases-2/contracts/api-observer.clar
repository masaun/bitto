(define-data-var call-counter uint u0)
(define-data-var error-counter uint u0)
(define-data-var api-enabled bool true)

(define-public (initialize)
  (ok (begin (var-set call-counter u0) (var-set error-counter u0))))

(define-public (execute-api-call (endpoint-id uint) (params uint))
  (if (var-get api-enabled)
    (ok (begin (var-set call-counter (+ (var-get call-counter) u1)) {endpoint: endpoint-id, params: params}))
    (err u1)))

(define-public (handle-error (error-code uint))
  (ok (begin (var-set error-counter (+ (var-get error-counter) u1)) error-code)))

(define-public (get-call-count)
  (ok (var-get call-counter)))

(define-public (get-error-count)
  (ok (var-get error-counter)))

(define-public (enable-api)
  (ok (begin (var-set api-enabled true) true)))

(define-public (query-api-status)
  (ok {calls: (var-get call-counter), errors: (var-get error-counter), enabled: (var-get api-enabled)}))