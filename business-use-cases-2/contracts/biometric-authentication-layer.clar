(define-constant contract-owner tx-sender)
(define-constant err-auth-failed (err u100))

(define-map biometric-hashes principal (buff 32))
(define-map auth-attempts principal {count: uint, last-attempt: uint})

(define-public (register-biometric (bio-hash (buff 32)))
  (ok (map-set biometric-hashes tx-sender bio-hash)))

(define-public (authenticate (user principal) (bio-hash (buff 32)))
  (let ((stored-hash (unwrap! (map-get? biometric-hashes user) err-auth-failed)))
    (asserts! (is-eq stored-hash bio-hash) err-auth-failed)
    (ok true)))

(define-read-only (is-registered (user principal))
  (ok (is-some (map-get? biometric-hashes user))))
