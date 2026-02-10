(define-map access-rights {resource-id: uint, user: principal} {can-read: bool, can-write: bool})
(define-read-only (get-rights (res uint) (user principal)) (map-get? access-rights {resource-id: res, user: user}))
(define-public (grant-rights (res uint) (user principal) (read bool) (write bool))
  (begin
    (map-set access-rights {resource-id: res, user: user} {can-read: read, can-write: write})
    (ok true)))